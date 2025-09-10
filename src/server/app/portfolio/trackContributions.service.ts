import { Octokit } from "octokit";
import { db } from "~/server/db";
import { contributions, skills, contributionSkills, resolvedIssues, contributionMetrics, type Contribution, type Skill, type ResolvedIssue, type ContributionMetrics } from "~/server/db/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

export class TrackContributionsService {
  constructor(private octokit: Octokit) {}

  /**
   * Sync accepted PRs for a user from GitHub
   */
  async syncAcceptedPRs(userId: string): Promise<Contribution[]> {
    try {
      const login = await this.getUserLogin();

      // Fetch merged PRs using GraphQL
      const prs = await this.fetchMergedPRs(login);

      // Process and store contributions
      const contributionsData: Contribution[] = [];

      for (const pr of prs) {
        const contribution = await this.storeContribution(userId, pr);
        contributionsData.push(contribution);

        // Tag skills for this contribution
        await this.tagSkills(contribution, pr);
      }

      return contributionsData;
    } catch (error) {
      console.error("Error syncing accepted PRs:", error);
      throw new Error("Failed to sync contributions from GitHub");
    }
  }

  /**
   * Tag skills based on PR data and repository languages
   */
  async tagSkills(contribution: Contribution, prData: any): Promise<void> {
    try {
      const detectedSkills = this.detectSkillsFromPR(prData);

      for (const skillData of detectedSkills) {
        // Find or create skill
        let skill = await this.findOrCreateSkill(contribution.userId, skillData);

        // Link contribution to skill
        await this.linkContributionToSkill(contribution.id, skill.id, skillData.confidence);

        // Update skill usage statistics
        await this.updateSkillStats(skill.id, contribution.mergedAt);
      }
    } catch (error) {
      console.error("Error tagging skills:", error);
    }
  }

  /**
   * Get user's GitHub login
   */
  private async getUserLogin(): Promise<string> {
    const response = await this.octokit.graphql<{ viewer: { login: string } }>(
      `query { viewer { login } }`
    );
    return response.viewer.login;
  }

  /**
   * Fetch merged PRs using GitHub GraphQL API
   */
  private async fetchMergedPRs(login: string): Promise<any[]> {
    const query = `
      query ViewerMergedPRs($login: String!, $after: String) {
        user(login: $login) {
          pullRequests(first: 50, states: MERGED, after: $after, orderBy: {field: UPDATED_AT, direction: DESC}) {
            nodes {
              id
              number
              title
              url
              mergedAt
              additions
              deletions
              changedFiles
              repository {
                name
                owner {
                  login
                }
                primaryLanguage {
                  name
                }
              }
              files(first: 10) {
                nodes {
                  path
                }
              }
              labels(first: 5) {
                nodes {
                  name
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

    const allPRs: any[] = [];
    let hasNextPage = true;
    let after: string | null = null;

    while (hasNextPage) {
      const response: any = await this.octokit.graphql(query, {
        login,
        after,
      });

      const prs = response.user.pullRequests.nodes;
      allPRs.push(...prs);

      hasNextPage = response.user.pullRequests.pageInfo.hasNextPage;
      after = response.user.pullRequests.pageInfo.endCursor;

      // Limit to prevent excessive API calls
      if (allPRs.length >= 200) break;
    }

    return allPRs;
  }

  /**
   * Store contribution in database
   */
  private async storeContribution(userId: string, prData: any): Promise<Contribution> {
    // Check if contribution already exists
    const existing = await db
      .select()
      .from(contributions)
      .where(
        and(
          eq(contributions.userId, userId),
          eq(contributions.prId, prData.id)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0] as Contribution;
    }

    // Create new contribution
    const contributionData = {
      userId,
      prId: prData.id,
      prNumber: prData.number,
      title: prData.title,
      url: prData.url,
      repositoryName: prData.repository.name,
      repositoryOwner: prData.repository.owner.login,
      mergedAt: new Date(prData.mergedAt),
      additions: prData.additions,
      deletions: prData.deletions,
      changedFiles: prData.changedFiles,
      primaryLanguage: prData.repository.primaryLanguage?.name,
      labels: prData.labels.nodes.map((label: any) => label.name),
      files: prData.files.nodes.map((file: any) => file.path),
    };

    const result = await db
      .insert(contributions)
      .values(contributionData)
      .returning();

    return result[0] as Contribution;
  }

  /**
   * Detect skills from PR data
   */
  private detectSkillsFromPR(prData: any): Array<{ name: string; category: string; confidence: number }> {
    const skills: Array<{ name: string; category: string; confidence: number }> = [];

    // Primary language from repository
    if (prData.repository.primaryLanguage?.name) {
      skills.push({
        name: prData.repository.primaryLanguage.name,
        category: "language",
        confidence: 8,
      });
    }

    // Skills from file extensions
    const fileExtensions = prData.files.nodes.map((file: any) => {
      const parts = file.path.split(".");
      return parts.length > 1 ? parts[parts.length - 1] : "";
    });

    const languageMap: Record<string, string> = {
      js: "JavaScript",
      ts: "TypeScript",
      py: "Python",
      java: "Java",
      cpp: "C++",
      c: "C",
      cs: "C#",
      php: "PHP",
      rb: "Ruby",
      go: "Go",
      rs: "Rust",
      swift: "Swift",
      kt: "Kotlin",
      scala: "Scala",
      r: "R",
      sh: "Shell",
      ps1: "PowerShell",
      html: "HTML",
      css: "CSS",
      vue: "Vue.js",
      jsx: "React",
      tsx: "React",
      json: "JSON",
      md: "Markdown",
      yml: "YAML",
      yaml: "YAML",
    };

    const detectedLanguages = new Set<string>();
    fileExtensions.forEach((ext: string) => {
      const language = languageMap[ext.toLowerCase()];
      if (language && !detectedLanguages.has(language)) {
        detectedLanguages.add(language);
        skills.push({
          name: language,
          category: "language",
          confidence: 6,
        });
      }
    });

    // Skills from file paths (frameworks/tools)
    const filePaths = prData.files.nodes.map((file: any) => file.path.toLowerCase());

    const frameworkPatterns = [
      { pattern: /react/, name: "React", category: "framework", confidence: 7 },
      { pattern: /vue/, name: "Vue.js", category: "framework", confidence: 7 },
      { pattern: /angular/, name: "Angular", category: "framework", confidence: 7 },
      { pattern: /express/, name: "Express.js", category: "framework", confidence: 6 },
      { pattern: /django/, name: "Django", category: "framework", confidence: 7 },
      { pattern: /flask/, name: "Flask", category: "framework", confidence: 6 },
      { pattern: /spring/, name: "Spring", category: "framework", confidence: 7 },
      { pattern: /laravel/, name: "Laravel", category: "framework", confidence: 7 },
      { pattern: /rails/, name: "Ruby on Rails", category: "framework", confidence: 7 },
      { pattern: /next/, name: "Next.js", category: "framework", confidence: 6 },
      { pattern: /nuxt/, name: "Nuxt.js", category: "framework", confidence: 6 },
      { pattern: /qwik/, name: "Qwik", category: "framework", confidence: 6 },
      { pattern: /tailwind/, name: "Tailwind CSS", category: "tool", confidence: 5 },
      { pattern: /webpack/, name: "Webpack", category: "tool", confidence: 5 },
      { pattern: /vite/, name: "Vite", category: "tool", confidence: 5 },
      { pattern: /docker/, name: "Docker", category: "tool", confidence: 5 },
      { pattern: /kubernetes/, name: "Kubernetes", category: "tool", confidence: 5 },
    ];

    frameworkPatterns.forEach(({ pattern, name, category, confidence }) => {
      const hasMatch = filePaths.some((path: string) => pattern.test(path));
      if (hasMatch) {
        skills.push({ name, category, confidence });
      }
    });

    // Skills from labels
    const labelSkills = prData.labels.nodes
      .map((label: any) => label.name.toLowerCase())
      .filter((label: string) => {
        const skillLabels = ["javascript", "typescript", "python", "java", "react", "vue", "angular", "node", "frontend", "backend", "fullstack"];
        return skillLabels.some(skill => label.includes(skill));
      })
      .map((label: string) => ({
        name: label.charAt(0).toUpperCase() + label.slice(1),
        category: "skill",
        confidence: 4,
      }));

    skills.push(...labelSkills);

    return skills;
  }

  /**
   * Find or create a skill
   */
  private async findOrCreateSkill(userId: string, skillData: { name: string; category: string; confidence: number }): Promise<Skill> {
    // Try to find existing skill
    const existing = await db
      .select()
      .from(skills)
      .where(
        and(
          eq(skills.userId, userId),
          eq(skills.name, skillData.name)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0] as Skill;
    }

    // Create new skill
    const result = await db
      .insert(skills)
      .values({
        userId,
        name: skillData.name,
        category: skillData.category,
        proficiency: 1,
      })
      .returning();

    return result[0] as Skill;
  }

  /**
   * Link contribution to skill
   */
  private async linkContributionToSkill(contributionId: string, skillId: string, confidence: number): Promise<void> {
    // Check if link already exists
    const existing = await db
      .select()
      .from(contributionSkills)
      .where(
        and(
          eq(contributionSkills.contributionId, contributionId),
          eq(contributionSkills.skillId, skillId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return;
    }

    // Create link
    await db
      .insert(contributionSkills)
      .values({
        contributionId,
        skillId,
        confidence,
      });
  }

  /**
   * Update skill statistics
   */
  private async updateSkillStats(skillId: string, lastUsed: Date): Promise<void> {
    const skill = await db
      .select()
      .from(skills)
      .where(eq(skills.id, skillId))
      .limit(1);

    if (skill.length === 0) return;

    const currentSkill = skill[0] as Skill;
    const contributionCount = await db
      .select()
      .from(contributionSkills)
      .where(eq(contributionSkills.skillId, skillId));

    await db
      .update(skills)
      .set({
        lastUsed,
        totalContributions: contributionCount.length,
        firstUsed: currentSkill.firstUsed || lastUsed,
        proficiency: Math.min(10, Math.max(1, contributionCount.length)),
        updatedAt: new Date(),
      })
      .where(eq(skills.id, skillId));
  }

  /**
   * Get user's contribution portfolio
   */
  async getContributionPortfolio(userId: string): Promise<{
    contributions: Contribution[];
    skills: Skill[];
    stats: {
      totalContributions: number;
      totalAdditions: number;
      totalDeletions: number;
      topLanguages: Array<{ name: string; count: number }>;
    };
  }> {
    const userContributions = await db
      .select()
      .from(contributions)
      .where(eq(contributions.userId, userId))
      .orderBy(desc(contributions.mergedAt));

    const userSkills = await db
      .select()
      .from(skills)
      .where(eq(skills.userId, userId))
      .orderBy(desc(skills.totalContributions));

    const stats = {
      totalContributions: userContributions.length,
      totalAdditions: userContributions.reduce((sum, c) => sum + c.additions, 0),
      totalDeletions: userContributions.reduce((sum, c) => sum + c.deletions, 0),
      topLanguages: this.calculateTopLanguages(userContributions.map(c => ({
        ...c,
        labels: Array.isArray(c.labels) ? c.labels : []
      })) as Contribution[]),
    };

    return {
      contributions: userContributions as Contribution[],
      skills: userSkills as Skill[],
      stats,
    };
  }

  /**
   * Calculate top languages from contributions
   */
  private calculateTopLanguages(contributions: Contribution[]): Array<{ name: string; count: number }> {
    const languageCount: Record<string, number> = {};

    contributions.forEach(contribution => {
      if (contribution.primaryLanguage) {
        languageCount[contribution.primaryLanguage] = (languageCount[contribution.primaryLanguage] || 0) + 1;
      }
    });

    return Object.entries(languageCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Sync resolved issues from GitHub
   */
  async syncResolvedIssues(userId: string): Promise<ResolvedIssue[]> {
    try {
      const login = await this.getUserLogin();

      // Get all user contributions to find which issues they resolved
      const userContributions = await db
        .select()
        .from(contributions)
        .where(eq(contributions.userId, userId));

      const resolvedIssuesData: ResolvedIssue[] = [];

      for (const contribution of userContributions) {
        // Query GitHub to find issues resolved by this PR
        const issues = await this.findIssuesResolvedByPR({
          ...contribution,
          labels: Array.isArray(contribution.labels) ? contribution.labels : [],
          files: Array.isArray(contribution.files) ? contribution.files : [],
        } as Contribution);

        for (const issue of issues) {
          const resolvedIssue = await this.storeResolvedIssue(userId, issue, contribution.prId);
          if (resolvedIssue) {
            resolvedIssuesData.push(resolvedIssue);
          }
        }
      }

      return resolvedIssuesData;
    } catch (error) {
      console.error("Error syncing resolved issues:", error);
      throw new Error("Failed to sync resolved issues");
    }
  }

  /**
   * Find issues resolved by a specific PR
   */
  private async findIssuesResolvedByPR(contribution: Contribution): Promise<any[]> {
    try {
      // Use GitHub's GraphQL to find issues closed by this PR
      const query = `
        query PRClosingIssues($owner: String!, $repo: String!, $number: Int!) {
          repository(owner: $owner, name: $repo) {
            pullRequest(number: $number) {
              closingIssuesReferences(first: 10) {
                nodes {
                  id
                  number
                  title
                  url
                  closedAt
                  labels(first: 5) {
                    nodes {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response: any = await this.octokit.graphql(query, {
        owner: contribution.repositoryOwner,
        repo: contribution.repositoryName,
        number: contribution.prNumber,
      });

      return response.repository.pullRequest.closingIssuesReferences.nodes || [];
    } catch (error) {
      console.error("Error finding issues resolved by PR:", error);
      return [];
    }
  }

  /**
   * Store resolved issue in database
   */
  private async storeResolvedIssue(userId: string, issueData: any, resolvedBy: string): Promise<ResolvedIssue | null> {
    try {
      // Check if issue already exists
      const existing = await db
        .select()
        .from(resolvedIssues)
        .where(
          and(
            eq(resolvedIssues.userId, userId),
            eq(resolvedIssues.issueId, issueData.id)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return existing[0] as ResolvedIssue;
      }

      // Create new resolved issue
      const result = await db
        .insert(resolvedIssues)
        .values({
          userId,
          issueId: issueData.id,
          issueNumber: issueData.number,
          title: issueData.title,
          url: issueData.url,
          repositoryName: issueData.url.split('/')[4], // Extract repo name from URL
          repositoryOwner: issueData.url.split('/')[3], // Extract owner from URL
          resolvedAt: new Date(issueData.closedAt),
          resolvedBy,
          labels: issueData.labels.nodes.map((label: any) => label.name),
        })
        .returning();

      return result[0] as ResolvedIssue;
    } catch (error) {
      console.error("Error storing resolved issue:", error);
      return null;
    }
  }

  /**
   * Calculate and store contribution metrics for different time periods
   */
  async calculateImpactMetrics(userId: string): Promise<ContributionMetrics[]> {
    try {
      const now = new Date();
      const periods = [
        { type: 'monthly', months: 1 },
        { type: 'quarterly', months: 3 },
        { type: 'yearly', months: 12 },
      ];

      const metrics: ContributionMetrics[] = [];

      for (const period of periods) {
        const periodStart = new Date(now);
        periodStart.setMonth(now.getMonth() - period.months);

        const periodEnd = new Date(now);

        // Get contributions in this period
        const periodContributions = await db
          .select()
          .from(contributions)
          .where(
            and(
              eq(contributions.userId, userId),
              gte(contributions.mergedAt, periodStart),
              lte(contributions.mergedAt, periodEnd)
            )
          );

        // Get resolved issues in this period
        const periodResolvedIssues = await db
          .select()
          .from(resolvedIssues)
          .where(
            and(
              eq(resolvedIssues.userId, userId),
              gte(resolvedIssues.resolvedAt, periodStart),
              lte(resolvedIssues.resolvedAt, periodEnd)
            )
          );

        // Calculate metrics
        const totalAdditions = periodContributions.reduce((sum, c) => sum + c.additions, 0);
        const totalDeletions = periodContributions.reduce((sum, c) => sum + c.deletions, 0);
        const totalFilesChanged = periodContributions.reduce((sum, c) => sum + c.changedFiles, 0);

        // Get unique repositories
        const uniqueRepos = new Set(
          periodContributions.map(c => `${c.repositoryOwner}/${c.repositoryName}`)
        );

        // Get languages used
        const languagesUsed = Array.from(
          new Set(
            periodContributions
              .map(c => c.primaryLanguage)
              .filter(lang => lang !== null)
          )
        );

      // Get skills demonstrated
      const skillsUsed = await this.getSkillsUsedInPeriod(userId, periodStart, periodEnd);        const metricData = {
          userId,
          period: period.type,
          periodStart,
          periodEnd,
          totalContributions: periodContributions.length,
          totalAdditions,
          totalDeletions,
          totalFilesChanged,
          resolvedIssues: periodResolvedIssues.length,
          repositoriesContributed: uniqueRepos.size,
          languagesUsed,
          skillsDemonstrated: skillsUsed,
        };

        // Store or update metrics
        const existingMetric = await db
          .select()
          .from(contributionMetrics)
          .where(
            and(
              eq(contributionMetrics.userId, userId),
              eq(contributionMetrics.period, period.type),
              gte(contributionMetrics.periodStart, periodStart),
              lte(contributionMetrics.periodEnd, periodEnd)
            )
          )
          .limit(1);

        if (existingMetric.length > 0) {
          // Update existing
          await db
            .update(contributionMetrics)
            .set({ ...metricData, updatedAt: new Date() })
            .where(eq(contributionMetrics.id, existingMetric[0].id));
        } else {
          // Create new
          await db
            .insert(contributionMetrics)
            .values(metricData);
        }

        metrics.push(metricData as ContributionMetrics);
      }

      return metrics;
    } catch (error) {
      console.error("Error calculating impact metrics:", error);
      throw new Error("Failed to calculate impact metrics");
    }
  }

  /**
   * Get skills used in a specific time period
   */
  private async getSkillsUsedInPeriod(userId: string, startDate: Date, endDate: Date): Promise<string[]> {
    try {
      const skillData = await db
        .select({
          skillName: skills.name,
        })
        .from(contributionSkills)
        .innerJoin(contributions, eq(contributionSkills.contributionId, contributions.id))
        .innerJoin(skills, eq(contributionSkills.skillId, skills.id))
        .where(
          and(
            eq(contributions.userId, userId),
            gte(contributions.mergedAt, startDate),
            lte(contributions.mergedAt, endDate)
          )
        );

      return Array.from(new Set(skillData.map((s: any) => s.skillName)));
    } catch (error) {
      console.error("Error getting skills used in period:", error);
      return [];
    }
  }

  /**
   * Get comprehensive impact metrics for a user
   */
  async getImpactMetrics(userId: string): Promise<{
    overall: {
      totalContributions: number;
      totalAdditions: number;
      totalDeletions: number;
      totalFilesChanged: number;
      resolvedIssues: number;
      repositoriesContributed: number;
      languagesUsed: number;
      skillsDemonstrated: number;
    };
    byPeriod: ContributionMetrics[];
    contributionFrequency: Array<{ period: string; count: number }>;
    topLanguages: Array<{ name: string; count: number; percentage: number }>;
    topSkills: Array<{ name: string; count: number; category: string }>;
  }> {
    try {
      // Get all contributions
      const allContributions = await db
        .select()
        .from(contributions)
        .where(eq(contributions.userId, userId));

      // Get all resolved issues
      const allResolvedIssues = await db
        .select()
        .from(resolvedIssues)
        .where(eq(resolvedIssues.userId, userId));

      // Get metrics by period
      const metricsByPeriod = await db
        .select()
        .from(contributionMetrics)
        .where(eq(contributionMetrics.userId, userId))
        .orderBy(desc(contributionMetrics.periodStart));

      // Calculate overall metrics
      const totalAdditions = allContributions.reduce((sum, c) => sum + c.additions, 0);
      const totalDeletions = allContributions.reduce((sum, c) => sum + c.deletions, 0);
      const totalFilesChanged = allContributions.reduce((sum, c) => sum + c.changedFiles, 0);

      // Get unique repositories
      const uniqueRepos = new Set(
        allContributions.map(c => `${c.repositoryOwner}/${c.repositoryName}`)
      );

      // Get unique languages
      const uniqueLanguages = new Set(
        allContributions
          .map(c => c.primaryLanguage)
          .filter(lang => lang !== null)
      );

      // Get unique skills
      const uniqueSkills = await this.getSkillsUsedInPeriod(
        userId,
        new Date(0), // From beginning of time
        new Date() // To now
      );

      // Calculate contribution frequency (monthly)
      const contributionFrequency = await this.calculateContributionFrequency(userId);

      // Calculate top languages with percentages
      const topLanguages = this.calculateTopLanguages(allContributions.map(c => ({
        ...c,
        labels: Array.isArray(c.labels) ? c.labels : []
      })) as Contribution[]);
      const totalLangContributions = topLanguages.reduce((sum, lang) => sum + lang.count, 0);
      const topLanguagesWithPercentage = topLanguages.map(lang => ({
        ...lang,
        percentage: totalLangContributions > 0 ? Math.round((lang.count / totalLangContributions) * 100) : 0,
      }));

      // Calculate top skills
      const topSkills = await this.calculateTopSkills(userId);

      return {
        overall: {
          totalContributions: allContributions.length,
          totalAdditions,
          totalDeletions,
          totalFilesChanged,
          resolvedIssues: allResolvedIssues.length,
          repositoriesContributed: uniqueRepos.size,
          languagesUsed: uniqueLanguages.size,
          skillsDemonstrated: uniqueSkills.length,
        },
        byPeriod: metricsByPeriod as ContributionMetrics[],
        contributionFrequency,
        topLanguages: topLanguagesWithPercentage,
        topSkills,
      };
    } catch (error) {
      console.error("Error getting impact metrics:", error);
      throw new Error("Failed to get impact metrics");
    }
  }

  /**
   * Calculate contribution frequency by month
   */
  private async calculateContributionFrequency(userId: string): Promise<Array<{ period: string; count: number }>> {
    try {
      const contribData = await db
        .select({
          mergedAt: contributions.mergedAt,
        })
        .from(contributions)
        .where(eq(contributions.userId, userId))
        .orderBy(desc(contributions.mergedAt));

      const monthlyCount: Record<string, number> = {};

      contribData.forEach((contrib: any) => {
        const date = new Date(contrib.mergedAt);
        const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyCount[period] = (monthlyCount[period] || 0) + 1;
      });

      return Object.entries(monthlyCount)
        .map(([period, count]) => ({ period, count }))
        .sort((a, b) => b.period.localeCompare(a.period))
        .slice(0, 12); // Last 12 months
    } catch (error) {
      console.error("Error calculating contribution frequency:", error);
      return [];
    }
  }

  /**
   * Calculate top skills by usage count
   */
  private async calculateTopSkills(userId: string): Promise<Array<{ name: string; count: number; category: string }>> {
    try {
      const skillCounts = await db
        .select({
          skillName: skills.name,
          category: skills.category,
          count: sql<number>`COUNT(${contributionSkills.id})`,
        })
        .from(contributionSkills)
        .innerJoin(contributions, eq(contributionSkills.contributionId, contributions.id))
        .innerJoin(skills, eq(contributionSkills.skillId, skills.id))
        .where(eq(contributions.userId, userId))
        .groupBy(skills.id, skills.name, skills.category)
        .orderBy(desc(sql`COUNT(${contributionSkills.id})`))
        .limit(10);

      return skillCounts.map(skill => ({
        name: skill.skillName,
        count: skill.count,
        category: skill.category,
      }));
    } catch (error) {
      console.error("Error calculating top skills:", error);
      return [];
    }
  }

  /**
   * Get dashboard data for growth/portfolio dashboard
   */
  async getDashboardData(userId: string): Promise<{
    skills: Array<{ name: string; category: string; totalLines: number; prCount: number; proficiency: number }>;
    projects: Array<{ repoName: string; repoOwner: string; prCount: number; totalLines: number; lastContribution: Date }>;
    timeline: Array<{ date: string; count: number }>;
  }> {
    try {
      // Get skills with total lines and PR count
      const skillsData = await db
        .select({
          skillName: skills.name,
          category: skills.category,
          proficiency: skills.proficiency,
          totalLines: sql<number>`SUM(${contributions.additions} + ${contributions.deletions})`,
          prCount: sql<number>`COUNT(DISTINCT ${contributions.id})`,
        })
        .from(skills)
        .innerJoin(contributionSkills, eq(skills.id, contributionSkills.skillId))
        .innerJoin(contributions, eq(contributionSkills.contributionId, contributions.id))
        .where(eq(skills.userId, userId))
        .groupBy(skills.id, skills.name, skills.category, skills.proficiency)
        .orderBy(desc(sql`SUM(${contributions.additions} + ${contributions.deletions})`))
        .limit(10);

      // Get projects grouped by repository
      const projectsData = await db
        .select({
          repoName: contributions.repositoryName,
          repoOwner: contributions.repositoryOwner,
          prCount: sql<number>`COUNT(${contributions.id})`,
          totalLines: sql<number>`SUM(${contributions.additions} + ${contributions.deletions})`,
          lastContribution: sql<Date>`MAX(${contributions.mergedAt})`,
        })
        .from(contributions)
        .where(eq(contributions.userId, userId))
        .groupBy(contributions.repositoryName, contributions.repositoryOwner)
        .orderBy(desc(sql`COUNT(${contributions.id})`))
        .limit(10);

      // Get timeline data (daily contributions for the last 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const timelineData = await db
        .select({
          date: sql<string>`DATE(${contributions.mergedAt})`,
          count: sql<number>`COUNT(${contributions.id})`,
        })
        .from(contributions)
        .where(
          and(
            eq(contributions.userId, userId),
            gte(contributions.mergedAt, ninetyDaysAgo)
          )
        )
        .groupBy(sql`DATE(${contributions.mergedAt})`)
        .orderBy(sql`DATE(${contributions.mergedAt})`);

      return {
        skills: skillsData.map(skill => ({
          name: skill.skillName,
          category: skill.category,
          totalLines: skill.totalLines || 0,
          prCount: skill.prCount || 0,
          proficiency: skill.proficiency,
        })),
        projects: projectsData.map(project => ({
          repoName: project.repoName,
          repoOwner: project.repoOwner,
          prCount: project.prCount || 0,
          totalLines: project.totalLines || 0,
          lastContribution: project.lastContribution,
        })),
        timeline: timelineData.map(item => ({
          date: item.date,
          count: item.count || 0,
        })),
      };
    } catch (error) {
      console.error("Error getting dashboard data:", error);
      throw new Error("Failed to get dashboard data");
    }
  }
}
