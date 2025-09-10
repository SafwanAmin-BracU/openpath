import { getOctokit } from "../octokit";
import { db } from "../../db";
import { opportunityRecommendations, skills, contributions } from "../../db/schema";
import { eq, and, lt, desc, inArray } from "drizzle-orm";
import { ViabilityScoreService } from "./viabilityScore.service";
import type { IssueRecommendation, OpportunityRecommendation } from "../../db/schema";

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
    const languages = userSkills.length > 0 ? userSkills : ['javascript', 'python', 'typescript'];
    const topics = interests.length > 0 ? interests : ['web-development', 'api', 'testing'];

    for (let i = 0; i < 25; i++) {
      const language = languages[Math.floor(Math.random() * languages.length)];
      const topic = topics[Math.floor(Math.random() * topics.length)];

      issues.push({
        id: `issue_${i}`,
        number: 100 + i,
        title: this.generateIssueTitle(language, topic, i),
        body: `This is a ${experienceLevel} level issue related to ${language} and ${topic}.`,
        state: 'open',
        html_url: `https://github.com/mock-org/mock-repo/issues/${100 + i}`,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        labels: this.generateLabels(language, topic, experienceLevel),
        repository_name: `mock-repo-${i}`,
        repository_full_name: `mock-org/mock-repo-${i}`,
        repository_language: language,
        repository_topics: [topic, 'open-source'],
      });
    }

    return issues;
  }

  /**
   * Generate realistic issue titles
   */
  private generateIssueTitle(language: string, topic: string, index: number): string {
    const templates = [
      `Add ${topic} support for ${language}`,
      `Improve ${language} ${topic} documentation`,
      `Fix ${language} ${topic} bug in component`,
      `Enhance ${language} ${topic} performance`,
      `Add tests for ${language} ${topic} feature`,
      `Update ${language} ${topic} dependencies`,
      `Refactor ${language} ${topic} code structure`,
      `Add ${language} ${topic} error handling`,
      `Implement ${language} ${topic} caching`,
      `Create ${language} ${topic} examples`,
    ];

    return templates[index % templates.length];
  }

  /**
   * Generate appropriate labels for issues
   */
  private generateLabels(language: string, topic: string, experienceLevel: string): string[] {
    const labels = [language, topic];

    // Add difficulty labels
    if (experienceLevel === 'beginner' || Math.random() > 0.7) {
      labels.push('good first issue');
    }

    if (Math.random() > 0.5) {
      labels.push('help wanted');
    }

    if (Math.random() > 0.6) {
      labels.push('enhancement');
    }

    return labels;
  }

  /**
   * Assess difficulty of an issue based on various factors
   */
  private assessIssueDifficulty(issue: any): 'beginner' | 'intermediate' | 'advanced' {
    let score = 0;

    // Check for beginner-friendly labels
    if (issue.labels.includes('good first issue')) {
      score += 3;
    }

    // Check repository size (mock logic)
    const repoSize = issue.repository_name.length * 10; // Mock size calculation
    if (repoSize < 50) {
      score += 2;
    } else if (repoSize > 200) {
      score -= 1;
    }

    // Check issue complexity based on keywords
    const complexKeywords = ['refactor', 'architecture', 'performance', 'security'];
    const simpleKeywords = ['documentation', 'test', 'example', 'typo'];

    const title = issue.title.toLowerCase();
    complexKeywords.forEach(keyword => {
      if (title.includes(keyword)) score -= 1;
    });

    simpleKeywords.forEach(keyword => {
      if (title.includes(keyword)) score += 1;
    });

    // Determine difficulty level
    if (score >= 3) {
      return 'beginner';
    } else if (score >= 0) {
      return 'intermediate';
    } else {
      return 'advanced';
    }
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

    // Sort by score descending
    return scoredIssues.sort((a, b) => {
      // Primary sort by score
      if (a.issue.score !== b.issue.score) {
        return b.issue.score - a.issue.score;
      }
      // Secondary sort by project viability
      return b.projectViability - a.projectViability;
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

    if (interests.some(interest => issue.repository_topics.includes(interest))) {
      reasons.push(`aligns with your interest in ${issue.repository_topics.find(t => interests.includes(t))}`);
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
