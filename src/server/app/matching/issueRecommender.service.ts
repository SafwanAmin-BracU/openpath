import { getOctokit } from "../octokit";
import { db } from "../../db";
import { opportunityRecommendations, skills, contributions } from "../../db/schema";
import { eq, and, lt, desc, inArray } from "drizzle-orm";
import { ViabilityScoreService } from "./viabilityScore.service";
import type { IssueRecommendation, OpportunityRecommendation } from "../../db/schema";
import { MOCK_PROJECTS, MOCK_ISSUES, getMockProjectByFullName, getMockIssuesForProject } from "./mockData";

export class IssueRecommenderService {
  private viabilityService: ViabilityScoreService;

  constructor() {
    this.viabilityService = new ViabilityScoreService();
  }

  /**
   * Get personalized issue recommendations for a user
   * @param userId User ID
   * @param userSkills Array of user's skills
   * @param interests Array of user's interests
   * @returns Array of issue recommendations
   */
  async recommendOpportunities(
    userId: string,
    userSkills: string[] = [],
    interests: string[] = []
  ): Promise<IssueRecommendation[]> {
    try {
      // Check for cached recommendations first
      const cached = await this.getCachedRecommendations(userId);
      if (cached.length > 0) {
        return cached;
      }

      // Generate new recommendations
      const recommendations = await this.generateRecommendations(userId, userSkills, interests);

      // Cache the recommendations
      await this.cacheRecommendations(userId, recommendations);

      return recommendations;
    } catch (error) {
      console.error(`Error generating recommendations for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get cached recommendations if they exist and haven't expired
   */
  private async getCachedRecommendations(userId: string): Promise<IssueRecommendation[]> {
    const now = new Date();

    const cached = await db
      .select()
      .from(opportunityRecommendations)
      .where(
        and(
          eq(opportunityRecommendations.userId, userId),
          lt(opportunityRecommendations.expiresAt, now)
        )
      )
      .orderBy(desc(opportunityRecommendations.score))
      .limit(20);

    if (cached.length === 0) {
      return [];
    }

    // Convert to IssueRecommendation format
    return cached.map(rec => ({
      issue: {
        id: rec.issueId,
        number: rec.issueNumber,
        title: rec.issueTitle,
        state: 'open' as const,
        html_url: rec.issueUrl,
        created_at: rec.createdAt.toISOString(),
        updated_at: rec.createdAt.toISOString(),
        labels: [], // Would be populated from GitHub API
        repository_name: rec.repoName,
        repository_full_name: rec.repoFullName,
        repository_language: '', // Would be populated from GitHub API
        repository_topics: [], // Would be populated from GitHub API
        difficulty_labels: [],
      },
      repo: {
        id: rec.repoId,
        name: rec.repoName,
        owner: rec.repoOwner,
        full_name: rec.repoFullName,
        language: '', // Would be populated from GitHub API
        topics: [], // Would be populated from GitHub API
      },
      reason: rec.reason,
      difficulty: rec.difficulty as 'beginner' | 'intermediate' | 'advanced',
      projectViability: rec.projectViability,
    }));
  }

  /**
   * Generate new recommendations based on user's profile
   */
  private async generateRecommendations(
    userId: string,
    userSkills: string[],
    interests: string[]
  ): Promise<IssueRecommendation[]> {
    // Get user's contribution history to understand their experience level
    const userContributions = await this.getUserContributionHistory(userId);
    const experienceLevel = this.calculateExperienceLevel(userContributions);

    // Get candidate issues from GitHub
    const candidateIssues = await this.fetchCandidateIssues(userSkills, interests, experienceLevel);

    // Score and rank issues
    const scoredIssues = await this.scoreIssues(candidateIssues, userSkills, interests, experienceLevel);

    // Return top recommendations
    return scoredIssues.slice(0, 20);
  }

  /**
   * Get user's contribution history
   */
  private async getUserContributionHistory(userId: string) {
    const contributionsList = await db
      .select()
      .from(contributions)
      .where(eq(contributions.userId, userId))
      .orderBy(desc(contributions.mergedAt))
      .limit(50);

    return contributionsList;
  }

  /**
   * Calculate user's experience level based on contributions
   */
  private calculateExperienceLevel(contributions: any[]): 'beginner' | 'intermediate' | 'advanced' {
    if (contributions.length === 0) {
      return 'beginner';
    }

    const totalAdditions = contributions.reduce((sum, c) => sum + c.additions, 0);
    const totalPRs = contributions.length;
    const avgComplexity = totalAdditions / Math.max(1, totalPRs);

    if (totalPRs < 5 || avgComplexity < 50) {
      return 'beginner';
    } else if (totalPRs < 20 || avgComplexity < 200) {
      return 'intermediate';
    } else {
      return 'advanced';
    }
  }

  /**
   * Fetch candidate issues from GitHub based on skills and interests
   */
  private async fetchCandidateIssues(
    userSkills: string[],
    interests: string[],
    experienceLevel: string
  ): Promise<any[]> {
    // In a real implementation, this would use GitHub GraphQL API
    // For now, we'll return mock data

    const mockIssues = this.generateMockIssues(userSkills, interests, experienceLevel);

    // Add difficulty assessment
    return mockIssues.map(issue => ({
      ...issue,
      difficulty: this.assessIssueDifficulty(issue),
    }));
  }

  /**
   * Generate mock issues for demonstration
   */
  private generateMockIssues(
    userSkills: string[],
    interests: string[],
    experienceLevel: string
  ): any[] {
    const issues = [];
    const selectedProjects = this.selectRelevantProjects(MOCK_PROJECTS, userSkills, interests);

    for (let i = 0; i < Math.min(30, selectedProjects.length * 2); i++) {
      const project = selectedProjects[i % selectedProjects.length];
      const projectIssues = getMockIssuesForProject(project.owner, project.name);

      if (projectIssues.length > 0) {
        const issueData = projectIssues[i % projectIssues.length];

        issues.push({
          id: `issue_${project.owner}_${project.name}_${i}`,
          number: 1000 + i,
          title: issueData.title,
          body: issueData.body,
          state: 'open',
          html_url: `https://github.com/${project.owner}/${project.name}/issues/${1000 + i}`,
          created_at: issueData.created_at,
          labels: issueData.labels,
          repository_name: project.name,
          repository_full_name: `${project.owner}/${project.name}`,
          repository_language: project.language,
          repository_topics: project.topics,
          difficulty: issueData.difficulty,
        });
      } else {
        // Fallback for projects without specific issues
        const fallbackIssue = this.generateFallbackIssue(project, i, experienceLevel);
        issues.push(fallbackIssue);
      }
    }

    return issues;
  }

  /**
   * Generate fallback issue for projects without specific mock data
   */
  private generateFallbackIssue(project: any, index: number, experienceLevel: string) {
    const templates = this.getGenericIssueTemplates(project);
    const template = templates[index % templates.length];

    return {
      id: `issue_${project.owner}_${project.name}_${index}`,
      number: 1000 + index,
      title: template.title,
      body: template.body,
      state: 'open',
      html_url: `https://github.com/${project.owner}/${project.name}/issues/${1000 + index}`,
      created_at: this.generateRealisticDate(),
      labels: this.generateRealisticLabels(project, experienceLevel, template.difficulty),
      repository_name: project.name,
      repository_full_name: `${project.owner}/${project.name}`,
      repository_language: project.language,
      repository_topics: project.topics,
      difficulty: template.difficulty,
    };
  }

  /**
   * Select projects most relevant to user's skills and interests
   */
  private selectRelevantProjects(
    projects: any[],
    userSkills: string[],
    interests: string[]
  ): any[] {
    return projects
      .map(project => {
        let relevanceScore = 0;

        // Language match
        if (userSkills.includes(project.language)) {
          relevanceScore += 3;
        }

        // Topic/interests match
        const topicMatches = project.topics.filter((topic: string) =>
          interests.some((interest: string) =>
            topic.toLowerCase().includes(interest.toLowerCase()) ||
            interest.toLowerCase().includes(topic.toLowerCase())
          )
        );
        relevanceScore += topicMatches.length * 2;

        return { ...project, relevanceScore };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 15); // Return top 15 most relevant projects
  }

  /**
   * Get generic issue templates for projects without specific templates
   */
  private getGenericIssueTemplates(project: any) {
    const genericTemplates = [
      {
        title: `Add ${project.topics[0]} documentation improvements`,
        body: `The ${project.topics[0]} documentation could be enhanced with more examples and clearer explanations. Consider adding tutorials, API reference improvements, and troubleshooting guides.`,
        difficulty: 'beginner' as const
      },
      {
        title: `Improve ${project.language} ${project.topics[0]} performance`,
        body: `There are opportunities to improve performance in the ${project.language} ${project.topics[0]} implementation. Focus areas include memory usage, execution speed, and resource optimization.`,
        difficulty: 'intermediate' as const
      },
      {
        title: `Add ${project.topics[0]} testing infrastructure`,
        body: `The project needs better testing infrastructure for ${project.topics[0]} functionality. This includes unit tests, integration tests, and potentially end-to-end testing setup.`,
        difficulty: 'intermediate' as const
      },
      {
        title: `Implement ${project.language} ${project.topics[0]} feature`,
        body: `A new ${project.topics[0]} feature needs to be implemented in ${project.language}. This involves designing the API, implementing the core functionality, and adding appropriate tests.`,
        difficulty: 'advanced' as const
      },
      {
        title: `Fix ${project.language} ${project.topics[0]} bug`,
        body: `There's a bug in the ${project.language} ${project.topics[0]} implementation that needs to be addressed. The issue involves [specific problem description] and requires careful debugging and testing.`,
        difficulty: 'intermediate' as const
      },
      {
        title: `Add ${project.language} ${project.topics[0]} examples`,
        body: `The project would benefit from more practical examples showing how to use ${project.topics[0]} features in ${project.language}. Focus on real-world use cases and best practices.`,
        difficulty: 'beginner' as const
      },
      {
        title: `Enhance ${project.language} ${project.topics[0]} error handling`,
        body: `The error handling in ${project.language} ${project.topics[0]} could be improved to provide better user experience and debugging information.`,
        difficulty: 'intermediate' as const
      },
      {
        title: `Add ${project.language} ${project.topics[0]} configuration options`,
        body: `More configuration options are needed for ${project.topics[0]} in ${project.language} to support different use cases and deployment scenarios.`,
        difficulty: 'intermediate' as const
      },
      {
        title: `Implement ${project.language} ${project.topics[0]} caching`,
        body: `Add caching support to ${project.topics[0]} in ${project.language} to improve performance and reduce redundant operations.`,
        difficulty: 'advanced' as const
      },
      {
        title: `Update ${project.language} ${project.topics[0]} dependencies`,
        body: `Several dependencies in the ${project.language} ${project.topics[0]} module are outdated and should be updated to their latest versions.`,
        difficulty: 'intermediate' as const
      },
      {
        title: `Add ${project.language} ${project.topics[0]} logging`,
        body: `Improve logging in ${project.language} ${project.topics[0]} to provide better observability and debugging capabilities.`,
        difficulty: 'beginner' as const
      },
      {
        title: `Refactor ${project.language} ${project.topics[0]} architecture`,
        body: `The ${project.language} ${project.topics[0]} architecture needs refactoring to improve maintainability, scalability, and code organization.`,
        difficulty: 'advanced' as const
      }
    ];

    return genericTemplates;
  }

  /**
   * Generate realistic labels for issues
   */
  private generateRealisticLabels(project: any, experienceLevel: string, issueDifficulty: string) {
    const labels = [project.language];

    // Add project-specific labels
    if (project.topics.length > 0) {
      labels.push(project.topics[0]);
    }

    // Add difficulty-based labels
    if (issueDifficulty === 'beginner' || Math.random() > 0.6) {
      labels.push('good first issue');
    }

    // Add status labels
    if (Math.random() > 0.7) {
      labels.push('help wanted');
    }

    if (Math.random() > 0.5) {
      labels.push('enhancement');
    }

    if (Math.random() > 0.8) {
      labels.push('bug');
    }

    // Add priority labels
    if (Math.random() > 0.85) {
      labels.push('priority: high');
    } else if (Math.random() > 0.7) {
      labels.push('priority: medium');
    }

    return labels;
  }

  /**
   * Generate realistic creation dates
   */
  private generateRealisticDate(): string {
    // Issues from last 90 days, with more recent ones being more likely
    const daysAgo = Math.floor(Math.pow(Math.random(), 2) * 90);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  }

  /**
   * Assess difficulty of an issue based on various factors
   */
  private assessIssueDifficulty(issue: any): 'beginner' | 'intermediate' | 'advanced' {
    // Use the difficulty from the generated issue data
    return issue.difficulty || 'intermediate';
  }

  /**
   * Score issues based on relevance to user
   */
  private async scoreIssues(
    issues: any[],
    userSkills: string[],
    interests: string[],
    experienceLevel: string
  ): Promise<IssueRecommendation[]> {
    const scoredIssues: IssueRecommendation[] = [];

    for (const issue of issues) {
      // Calculate relevance score
      let score = 0;

      // Skill match
      if (userSkills.includes(issue.repository_language)) {
        score += 3;
      }

      // Interest match
      if (interests.some(interest => issue.repository_topics.includes(interest))) {
        score += 2;
      }

      // Difficulty match
      if (this.isDifficultyMatch(issue.difficulty, experienceLevel)) {
        score += 2;
      }

      // Recency bonus
      const daysSinceCreated = (Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 7) {
        score += 1;
      }

      // Get project viability
      const [repoOwner, repoName] = issue.repository_full_name.split('/');
      const viabilityScore = await this.viabilityService.calculateViabilityScore(repoOwner, repoName);

      // Only include issues with decent scores
      if (score >= 2) {
        scoredIssues.push({
          issue,
          repo: {
            id: issue.repository_full_name,
            name: issue.repository_name,
            owner: repoOwner,
            full_name: issue.repository_full_name,
            language: issue.repository_language,
            topics: issue.repository_topics,
          },
          reason: this.generateRecommendationReason(issue, score, userSkills, interests),
          difficulty: issue.difficulty,
          projectViability: viabilityScore,
        });
      }
    }

    // Sort by score descending (score is stored separately)
    return scoredIssues.sort((a, b) => {
      // Primary sort by project viability (as a proxy for overall quality)
      if (a.projectViability !== b.projectViability) {
        return b.projectViability - a.projectViability;
      }
      // Secondary sort by recency
      const aDate = new Date(a.issue.created_at).getTime();
      const bDate = new Date(b.issue.created_at).getTime();
      return bDate - aDate;
    });
  }

  /**
   * Check if issue difficulty matches user's experience level
   */
  private isDifficultyMatch(issueDifficulty: string, userLevel: string): boolean {
    const difficultyMap = {
      beginner: ['beginner'],
      intermediate: ['beginner', 'intermediate'],
      advanced: ['intermediate', 'advanced'],
    };

    return difficultyMap[userLevel as keyof typeof difficultyMap]?.includes(issueDifficulty) || false;
  }

  /**
   * Generate explanation for why this issue was recommended
   */
  private generateRecommendationReason(
    issue: any,
    score: number,
    userSkills: string[],
    interests: string[]
  ): string {
    const reasons = [];

    if (userSkills.includes(issue.repository_language)) {
      reasons.push(`matches your ${issue.repository_language} skills`);
    }

    if (interests.some((interest: string) => issue.repository_topics.includes(interest))) {
      const matchingTopic = issue.repository_topics.find((t: string) => interests.includes(t));
      if (matchingTopic) {
        reasons.push(`aligns with your interest in ${matchingTopic}`);
      }
    }

    if (issue.difficulty === 'beginner') {
      reasons.push('is a good first issue');
    }

    if (score >= 5) {
      reasons.push('is highly relevant to your profile');
    }

    return reasons.length > 0 ? reasons.join(', ') : 'matches your general interests';
  }

  /**
   * Cache recommendations in database
   */
  private async cacheRecommendations(
    userId: string,
    recommendations: IssueRecommendation[]
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Cache for 24 hours

    const values = recommendations.map(rec => ({
      userId,
      repoId: rec.repo.id,
      repoName: rec.repo.name,
      repoOwner: rec.repo.owner,
      repoFullName: rec.repo.full_name,
      issueId: rec.issue.id,
      issueNumber: rec.issue.number,
      issueTitle: rec.issue.title,
      issueUrl: rec.issue.html_url,
      score: Math.floor(Math.random() * 10) + 1, // Mock score for caching
      difficulty: rec.difficulty,
      reason: rec.reason,
      projectViability: rec.projectViability,
      expiresAt,
    }));

    // Insert in batches to avoid database limits
    for (let i = 0; i < values.length; i += 10) {
      const batch = values.slice(i, i + 10);
      await db.insert(opportunityRecommendations).values(batch);
    }
  }
}
