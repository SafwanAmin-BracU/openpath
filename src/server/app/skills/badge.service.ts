import { db } from "../../db";
import { badges, userBadges } from "../../db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { Badge, UserBadge, BadgeCriteria } from "../../db/schema";

export class BadgeService {
  /**
   * Get all available badges
   */
  async getAllBadges(): Promise<Badge[]> {
    const result = await db
      .select()
      .from(badges)
      .orderBy(desc(badges.createdAt));

    return result.map(badge => ({
      ...badge,
      criteria: badge.criteria as BadgeCriteria,
      rarity: badge.rarity as 'common' | 'rare' | 'epic' | 'legendary',
    }));
  }

  /**
   * Get badges by category
   */
  async getBadgesByCategory(category: string): Promise<Badge[]> {
    const result = await db
      .select()
      .from(badges)
      .where(eq(badges.category, category))
      .orderBy(desc(badges.createdAt));

    return result.map(badge => ({
      ...badge,
      criteria: badge.criteria as BadgeCriteria,
      rarity: badge.rarity as 'common' | 'rare' | 'epic' | 'legendary',
    }));
  }

  /**
   * Get badge by ID
   */
  async getBadgeById(badgeId: string): Promise<Badge | null> {
    const result = await db
      .select()
      .from(badges)
      .where(eq(badges.id, badgeId))
      .limit(1);

    if (!result[0]) return null;

    return {
      ...result[0],
      criteria: result[0].criteria as BadgeCriteria,
      rarity: result[0].rarity as 'common' | 'rare' | 'epic' | 'legendary',
    };
  }

  /**
   * Get user's earned badges
   */
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const result = await db
      .select({
        userBadge: userBadges,
        badge: badges,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));

    return result.map(({ userBadge, badge: badgeData }) => ({
      ...userBadge,
      badge: {
        ...badgeData,
        criteria: badgeData.criteria as BadgeCriteria,
        rarity: badgeData.rarity as 'common' | 'rare' | 'epic' | 'legendary',
      },
    }));
  }

  /**
   * Check if user has earned a specific badge
   */
  async hasUserEarnedBadge(userId: string, badgeId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(userBadges)
      .where(
        and(
          eq(userBadges.userId, userId),
          eq(userBadges.badgeId, badgeId)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  /**
   * Award badge to user
   */
  async awardBadgeToUser(
    userId: string,
    badgeId: string,
    earnedThrough: string
  ): Promise<UserBadge | null> {
    // Check if user already has this badge
    const hasBadge = await this.hasUserEarnedBadge(userId, badgeId);
    if (hasBadge) {
      return null; // Already earned
    }

    // Award the badge
    const [newUserBadge] = await db
      .insert(userBadges)
      .values({
        userId,
        badgeId,
        earnedThrough,
      })
      .returning();

    return newUserBadge;
  }

  /**
   * Check and award badges based on user actions
   */
  async checkAndAwardBadges(
    userId: string,
    action: {
      type: 'tutorial_completion' | 'milestone' | 'contribution_count' | 'skill_proficiency';
      target: string | number;
      context?: Record<string, any>;
    }
  ): Promise<UserBadge[]> {
    const awardedBadges: UserBadge[] = [];
    const allBadges = await this.getAllBadges();

    for (const badge of allBadges) {
      // Skip if user already has this badge
      if (await this.hasUserEarnedBadge(userId, badge.id)) {
        continue;
      }

      // Check if badge criteria are met
      if (await this.checkBadgeCriteria(userId, badge, action)) {
        const awarded = await this.awardBadgeToUser(
          userId,
          badge.id,
          `${action.type}: ${action.target}`
        );
        if (awarded) {
          awardedBadges.push(awarded);
        }
      }
    }

    return awardedBadges;
  }

  /**
   * Check if badge criteria are met for a user
   */
  private async checkBadgeCriteria(
    userId: string,
    badge: Badge,
    action: {
      type: 'tutorial_completion' | 'milestone' | 'contribution_count' | 'skill_proficiency';
      target: string | number;
      context?: Record<string, any>;
    }
  ): Promise<boolean> {
    const criteria = badge.criteria;

    switch (criteria.type) {
      case 'tutorial_completion':
        return await this.checkTutorialCompletionCriteria(userId, criteria, action);
      case 'milestone':
        return await this.checkMilestoneCriteria(userId, criteria, action);
      case 'contribution_count':
        return await this.checkContributionCountCriteria(userId, criteria, action);
      case 'skill_proficiency':
        return await this.checkSkillProficiencyCriteria(userId, criteria, action);
      default:
        return false;
    }
  }

  private async checkTutorialCompletionCriteria(
    userId: string,
    criteria: BadgeCriteria,
    action: any
  ): Promise<boolean> {
    if (action.type !== 'tutorial_completion') return false;

    // Check if the completed tutorial matches the criteria
    const targetTutorial = criteria.target as string;
    return action.target === targetTutorial;
  }

  private async checkMilestoneCriteria(
    userId: string,
    criteria: BadgeCriteria,
    action: any
  ): Promise<boolean> {
    if (action.type !== 'milestone') return false;

    const targetMilestone = criteria.target as string;
    return action.target === targetMilestone;
  }

  private async checkContributionCountCriteria(
    userId: string,
    criteria: BadgeCriteria,
    action: any
  ): Promise<boolean> {
    if (action.type !== 'contribution_count') return false;

    const targetCount = criteria.target as number;
    const actualCount = action.target as number;
    return actualCount >= targetCount;
  }

  private async checkSkillProficiencyCriteria(
    userId: string,
    criteria: BadgeCriteria,
    action: any
  ): Promise<boolean> {
    if (action.type !== 'skill_proficiency') return false;

    const targetSkill = criteria.target as string;
    const requiredLevel = criteria.conditions?.proficiencyLevel as number || 1;

    // Check user's skill proficiency
    const userSkills = await db
      .select()
      .from(require("../../db").skills)
      .where(
        and(
          eq(require("../../db").skills.userId, userId),
          eq(require("../../db").skills.name, targetSkill)
        )
      )
      .limit(1);

    if (userSkills.length === 0) return false;

    return userSkills[0].proficiency >= requiredLevel;
  }

  /**
   * Get badge statistics for user
   */
  async getUserBadgeStats(userId: string): Promise<{
    totalEarned: number;
    totalAvailable: number;
    completionRate: number;
    badgesByRarity: Record<string, number>;
    recentBadges: UserBadge[];
  }> {
    const userBadgesList = await this.getUserBadges(userId);
    const allBadges = await this.getAllBadges();

    const totalEarned = userBadgesList.length;
    const totalAvailable = allBadges.length;
    const completionRate = totalAvailable > 0 ? (totalEarned / totalAvailable) * 100 : 0;

    // Count badges by rarity
    const badgesByRarity: Record<string, number> = {};
    for (const userBadge of userBadgesList) {
      const badge = await this.getBadgeById(userBadge.badgeId);
      const rarity = badge?.rarity || 'common';
      badgesByRarity[rarity] = (badgesByRarity[rarity] || 0) + 1;
    }

    // Get recent badges (last 5)
    const recentBadges = userBadgesList.slice(0, 5);

    return {
      totalEarned,
      totalAvailable,
      completionRate: Math.round(completionRate),
      badgesByRarity,
      recentBadges,
    };
  }

  /**
   * Get leaderboard for badges
   */
  async getBadgeLeaderboard(badgeId: string, limit: number = 10): Promise<{
    badge: Badge;
    earners: Array<{
      userId: string;
      earnedAt: Date;
      earnedThrough: string;
    }>;
  }> {
    const badge = await this.getBadgeById(badgeId);
    if (!badge) {
      throw new Error("Badge not found");
    }

    const earners = await db
      .select({
        userId: userBadges.userId,
        earnedAt: userBadges.earnedAt,
        earnedThrough: userBadges.earnedThrough,
      })
      .from(userBadges)
      .where(eq(userBadges.badgeId, badgeId))
      .orderBy(desc(userBadges.earnedAt))
      .limit(limit);

    return {
      badge,
      earners,
    };
  }
}
