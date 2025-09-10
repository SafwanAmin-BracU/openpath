import { Octokit } from "octokit";
import { db } from "~/server/db";
import { contributions, skills, contributionSkills, type Contribution, type Skill } from "~/server/db/schema";
import { eq, and, desc } from "drizzle-orm";

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
      topLanguages: this.calculateTopLanguages(userContributions),
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
}
