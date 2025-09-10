import { db } from "~/server/db";
import { githubIssuesCache } from "~/server/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import type { GitHubIssue, FilterCriteria, FilterResult } from "~/server/db/schema";

/**
 * Database cache methods for GitHub issues filtering
 */
export class GitHubCacheService {
  /**
   * Retrieves cached GitHub issues if available and not expired
   */
  static async getCachedIssues(cacheKey: string): Promise<FilterResult | null> {
    try {
      const result = await db
        .select()
        .from(githubIssuesCache)
        .where(
          and(
            eq(githubIssuesCache.cacheKey, cacheKey),
            gt(githubIssuesCache.expiresAt, sql`NOW()`)
          )
        )
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      const cacheEntry = result[0];
      return JSON.parse(cacheEntry.data as string) as FilterResult;
    } catch (error) {
      console.error("Error retrieving cached issues:", error);
      return null;
    }
  }

  /**
   * Caches GitHub issues with 1-hour TTL
   */
  static async cacheIssues(cacheKey: string, issues: GitHubIssue[]): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour TTL

      const cacheData: FilterResult = {
        issues,
        total_count: issues.length,
        filter_applied: {
          language: null,
          topic: null,
          session_id: "",
        },
        cache_timestamp: new Date().toISOString(),
        is_from_cache: true,
      };

      await db
        .insert(githubIssuesCache)
        .values({
          cacheKey,
          data: JSON.stringify(cacheData),
          expiresAt,
          dataType: "issues",
        })
        .onConflictDoUpdate({
          target: githubIssuesCache.cacheKey,
          set: {
            data: JSON.stringify(cacheData),
            expiresAt,
            dataType: "issues",
          },
        });
    } catch (error) {
      console.error("Error caching issues:", error);
      // Don't throw - caching failure shouldn't break the main flow
    }
  }

  /**
   * Generates a cache key for the given filter criteria
   */
  static generateCacheKey(criteria: FilterCriteria): string {
    const { language, topic } = criteria;
    return `issues:${language || ""}:${topic || ""}`;
  }

  /**
   * Clears expired cache entries
   */
  static async clearExpiredCache(): Promise<number> {
    try {
      // Get count before deletion
      const beforeResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(githubIssuesCache)
        .where(sql`${githubIssuesCache.expiresAt} < NOW()`);

      const expiredCount = beforeResult[0]?.count || 0;

      if (expiredCount > 0) {
        await db
          .delete(githubIssuesCache)
          .where(sql`${githubIssuesCache.expiresAt} < NOW()`);
      }

      return expiredCount;
    } catch (error) {
      console.error("Error clearing expired cache:", error);
      return 0;
    }
  }

  /**
   * Gets cache statistics
   */
  static async getCacheStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
    activeEntries: number;
  }> {
    try {
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(githubIssuesCache);

      const expiredResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(githubIssuesCache)
        .where(sql`${githubIssuesCache.expiresAt} < NOW()`);

      const totalEntries = totalResult[0]?.count || 0;
      const expiredEntries = expiredResult[0]?.count || 0;
      const activeEntries = totalEntries - expiredEntries;

      return {
        totalEntries,
        expiredEntries,
        activeEntries,
      };
    } catch (error) {
      console.error("Error getting cache stats:", error);
      return {
        totalEntries: 0,
        expiredEntries: 0,
        activeEntries: 0,
      };
    }
  }

  /**
   * Manually refreshes cache for a specific key
   */
  static async refreshCache(cacheKey: string): Promise<boolean> {
    try {
      await db
        .delete(githubIssuesCache)
        .where(eq(githubIssuesCache.cacheKey, cacheKey));

      return true;
    } catch (error) {
      console.error("Error refreshing cache:", error);
      return false;
    }
  }

  /**
   * Gets all active cache keys
   */
  static async getActiveCacheKeys(): Promise<string[]> {
    try {
      const result = await db
        .select({ cacheKey: githubIssuesCache.cacheKey })
        .from(githubIssuesCache)
        .where(gt(githubIssuesCache.expiresAt, sql`NOW()`));

      return result.map(row => row.cacheKey);
    } catch (error) {
      console.error("Error getting active cache keys:", error);
      return [];
    }
  }
}
