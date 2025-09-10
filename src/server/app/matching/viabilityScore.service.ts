import { getOctokit } from "../octokit";
import { db } from "../../db";
import { projectViability } from "../../db/schema";
import { eq, and, lt } from "drizzle-orm";
import type { ProjectViability } from "../../db/schema";
import { getMockProjectByFullName } from "./mockData";

export class ViabilityScoreService {
  /**
   * Calculate project viability score for a repository
   * @param repoOwner Repository owner/organization
   * @param repoName Repository name
   * @returns Viability score (1-10)
   */
  async calculateViabilityScore(
    repoOwner: string,
    repoName: string
  ): Promise<number> {
    try {
      // Check if we have a cached viability score
      const cached = await this.getCachedViabilityScore(repoOwner, repoName);
      if (cached) {
        return cached.score;
      }

      // Calculate new viability score
      const score = await this.computeViabilityScore(repoOwner, repoName);

      // Cache the result
      await this.cacheViabilityScore(repoOwner, repoName, score);

      return score;
    } catch (error) {
      console.error(`Error calculating viability score for ${repoOwner}/${repoName}:`, error);
      // Return neutral score on error
      return 5;
    }
  }

  /**
   * Get cached viability score if it exists and hasn't expired
   */
  private async getCachedViabilityScore(
    repoOwner: string,
    repoName: string
  ): Promise<ProjectViability | null> {
    const repoId = `${repoOwner}/${repoName}`;

    const result = await db
      .select()
      .from(projectViability)
      .where(
        and(
          eq(projectViability.repoId, repoId),
          lt(projectViability.expiresAt, new Date())
        )
      )
      .limit(1);

    if (result[0]) {
      // Convert null to undefined for optional fields
      return {
        ...result[0],
        avgResponseTimeDays: result[0].avgResponseTimeDays || undefined,
      };
    }

    return null;
  }

  /**
   * Compute viability score from GitHub repository data
   */
  private async computeViabilityScore(
    repoOwner: string,
    repoName: string
  ): Promise<number> {
    // This would normally use Octokit to fetch real GitHub data
    // For now, we'll use mock data based on repository characteristics

    const repoFullName = `${repoOwner}/${repoName}`;

    // Mock repository data - in real implementation, this would come from GitHub API
    const mockRepoData = this.getMockRepositoryData(repoFullName);

    // Calculate weighted score
    let score = 0;

    // Documentation presence (3 points max)
    if (mockRepoData.hasReadme) score += 3;
    if (mockRepoData.hasContributing) score += 2;
    if (mockRepoData.hasCodeOfConduct) score += 2;

    // Response time (2 points max, lower response time = higher score)
    if (mockRepoData.avgResponseTimeDays !== undefined) {
      const responseScore = Math.max(0, 2 - mockRepoData.avgResponseTimeDays);
      score += responseScore;
    }

    // Community activity (4 points max)
    score += Math.min(2, mockRepoData.contributorsPast3Months / 5);
    score += Math.min(2, mockRepoData.recentCommitsPastMonth / 10);

    // Issue management (penalty for too many open issues)
    const openIssueRatio = mockRepoData.openIssuesCount / Math.max(1, mockRepoData.totalIssuesCount);
    if (openIssueRatio > 0.5) {
      score -= Math.min(2, (openIssueRatio - 0.5) * 4);
    }

    // Clamp score between 1 and 10
    return Math.max(1, Math.min(10, Math.round(score)));
  }

  /**
   * Cache viability score in database
   */
  private async cacheViabilityScore(
    repoOwner: string,
    repoName: string,
    score: number
  ): Promise<void> {
    const repoId = `${repoOwner}/${repoName}`;
    const repoFullName = `${repoOwner}/${repoName}`;

    // Get mock data for caching additional metrics
    const mockData = this.getMockRepositoryData(repoFullName);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Cache for 7 days

    await db.insert(projectViability).values({
      repoId,
      repoName,
      repoOwner,
      repoFullName,
      score,
      hasReadme: mockData.hasReadme,
      hasContributing: mockData.hasContributing,
      hasCodeOfConduct: mockData.hasCodeOfConduct,
      avgResponseTimeDays: mockData.avgResponseTimeDays,
      contributorsPast3Months: mockData.contributorsPast3Months,
      recentCommitsPastMonth: mockData.recentCommitsPastMonth,
      openIssuesCount: mockData.openIssuesCount,
      totalIssuesCount: mockData.totalIssuesCount,
      expiresAt,
    }).onConflictDoUpdate({
      target: projectViability.repoId,
      set: {
        score,
        hasReadme: mockData.hasReadme,
        hasContributing: mockData.hasContributing,
        hasCodeOfConduct: mockData.hasCodeOfConduct,
        avgResponseTimeDays: mockData.avgResponseTimeDays,
        contributorsPast3Months: mockData.contributorsPast3Months,
        recentCommitsPastMonth: mockData.recentCommitsPastMonth,
        openIssuesCount: mockData.openIssuesCount,
        totalIssuesCount: mockData.totalIssuesCount,
        computedAt: new Date(),
        expiresAt,
      },
    });
  }

  /**
   * Get mock repository data for viability calculation
   * In production, this would be replaced with actual GitHub API calls
   */
  private getMockRepositoryData(repoFullName: string): {
    hasReadme: boolean;
    hasContributing: boolean;
    hasCodeOfConduct: boolean;
    avgResponseTimeDays?: number;
    contributorsPast3Months: number;
    recentCommitsPastMonth: number;
    openIssuesCount: number;
    totalIssuesCount: number;
  } {
    // Get project data from centralized mock data
    const [owner, name] = repoFullName.split('/');
    const project = getMockProjectByFullName(owner, name);

    if (!project) {
      // Fallback for unknown projects
      return {
        hasReadme: Math.random() > 0.1,
        hasContributing: Math.random() > 0.3,
        hasCodeOfConduct: Math.random() > 0.4,
        avgResponseTimeDays: Math.floor(Math.random() * 7) + 1,
        contributorsPast3Months: Math.floor(Math.random() * 10) + 1,
        recentCommitsPastMonth: Math.floor(Math.random() * 20) + 1,
        openIssuesCount: Math.floor(Math.random() * 50) + 5,
        totalIssuesCount: Math.floor(Math.random() * 200) + 20,
      };
    }

    // Calculate metrics based on project characteristics
    const isPopular = (project.stars || 0) > 50000;
    const isWellMaintained = project.owner === 'microsoft' ||
                            project.owner === 'facebook' ||
                            project.owner === 'google' ||
                            project.owner === 'vercel';

    return {
      hasReadme: true, // Assume all our mock projects have README
      hasContributing: isWellMaintained || Math.random() > 0.3,
      hasCodeOfConduct: isWellMaintained || Math.random() > 0.4,
      avgResponseTimeDays: isWellMaintained ? 1 : Math.floor(Math.random() * 7) + 1,
      contributorsPast3Months: isPopular ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 10) + 1,
      recentCommitsPastMonth: isPopular ? Math.floor(Math.random() * 100) + 20 : Math.floor(Math.random() * 20) + 1,
      openIssuesCount: Math.floor(Math.random() * 50) + 5,
      totalIssuesCount: Math.floor(Math.random() * 200) + 20,
    };
  }

  /**
   * Get viability score for multiple repositories at once
   */
  async getBulkViabilityScores(
    repositories: Array<{ owner: string; name: string }>
  ): Promise<Record<string, number>> {
    const results: Record<string, number> = {};

    // Process in parallel with concurrency limit
    const concurrencyLimit = 5;
    for (let i = 0; i < repositories.length; i += concurrencyLimit) {
      const batch = repositories.slice(i, i + concurrencyLimit);
      const batchPromises = batch.map(repo =>
        this.calculateViabilityScore(repo.owner, repo.name)
          .then(score => ({ key: `${repo.owner}/${repo.name}`, score }))
      );

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ key, score }) => {
        results[key] = score;
      });
    }

    return results;
  }
}
