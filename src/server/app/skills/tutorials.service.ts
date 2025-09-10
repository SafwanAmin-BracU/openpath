import { db } from "../../db";
import { tutorials, userTutorialProgress } from "../../db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { Tutorial, UserTutorialProgress, TutorialStep, ValidationRule } from "../../db/schema";

export class TutorialsService {
  /**
   * Get all available tutorials
   */
  async getAllTutorials(): Promise<Tutorial[]> {
    const result = await db
      .select()
      .from(tutorials)
      .orderBy(desc(tutorials.createdAt));

    return result.map(tutorial => ({
      ...tutorial,
      steps: tutorial.steps as TutorialStep[],
      validationRules: tutorial.validationRules as ValidationRule[],
      difficulty: tutorial.difficulty as 'beginner' | 'intermediate' | 'advanced',
    }));
  }

  /**
   * Get tutorials by category
   */
  async getTutorialsByCategory(category: string): Promise<Tutorial[]> {
    const result = await db
      .select()
      .from(tutorials)
      .where(eq(tutorials.category, category))
      .orderBy(desc(tutorials.createdAt));

    return result.map(tutorial => ({
      ...tutorial,
      steps: tutorial.steps as TutorialStep[],
      validationRules: tutorial.validationRules as ValidationRule[],
      difficulty: tutorial.difficulty as 'beginner' | 'intermediate' | 'advanced',
    }));
  }

  /**
   * Get tutorial by ID
   */
  async getTutorialById(tutorialId: string): Promise<Tutorial | null> {
    const result = await db
      .select()
      .from(tutorials)
      .where(eq(tutorials.id, tutorialId))
      .limit(1);

    if (!result[0]) return null;

    return {
      ...result[0],
      steps: result[0].steps as TutorialStep[],
      validationRules: result[0].validationRules as ValidationRule[],
      difficulty: result[0].difficulty as 'beginner' | 'intermediate' | 'advanced',
    };
  }

  /**
   * Get user's tutorial progress
   */
  async getUserTutorialProgress(userId: string): Promise<UserTutorialProgress[]> {
    const result = await db
      .select()
      .from(userTutorialProgress)
      .where(eq(userTutorialProgress.userId, userId))
      .orderBy(desc(userTutorialProgress.updatedAt));

    return result.map(progress => ({
      ...progress,
      completedSteps: progress.completedSteps as number[],
      answers: progress.answers as Record<string, any>,
      completedAt: progress.completedAt || undefined,
    }));
  }

  /**
   * Get specific tutorial progress for user
   */
  async getUserTutorialProgressById(
    userId: string,
    tutorialId: string
  ): Promise<UserTutorialProgress | null> {
    const result = await db
      .select()
      .from(userTutorialProgress)
      .where(
        and(
          eq(userTutorialProgress.userId, userId),
          eq(userTutorialProgress.tutorialId, tutorialId)
        )
      )
      .limit(1);

    return result[0] ? {
      ...result[0],
      completedSteps: result[0].completedSteps as number[],
      answers: result[0].answers as Record<string, any>,
      completedAt: result[0].completedAt || undefined,
    } : null;
  }

  /**
   * Start or resume tutorial for user
   */
  async startTutorial(userId: string, tutorialId: string): Promise<UserTutorialProgress> {
    // Check if progress already exists
    const existing = await this.getUserTutorialProgressById(userId, tutorialId);

    if (existing) {
      return existing;
    }

    // Create new progress record
    const [newProgress] = await db
      .insert(userTutorialProgress)
      .values({
        userId,
        tutorialId,
        currentStep: 0,
        completedSteps: [],
        answers: {},
        isCompleted: false,
      })
      .returning();

    return {
      ...newProgress,
      completedSteps: newProgress.completedSteps as number[],
      answers: newProgress.answers as Record<string, any>,
      completedAt: newProgress.completedAt || undefined,
    };
  }

  /**
   * Update tutorial progress
   */
  async updateTutorialProgress(
    userId: string,
    tutorialId: string,
    stepIndex: number,
    answers: Record<string, any>
  ): Promise<UserTutorialProgress> {
    const existing = await this.getUserTutorialProgressById(userId, tutorialId);

    if (!existing) {
      throw new Error("Tutorial progress not found");
    }

    const completedSteps = [...(existing.completedSteps as number[])];
    if (!completedSteps.includes(stepIndex)) {
      completedSteps.push(stepIndex);
    }

    const [updated] = await db
      .update(userTutorialProgress)
      .set({
        currentStep: stepIndex,
        completedSteps,
        answers: { ...(existing.answers as Record<string, any>), ...answers },
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userTutorialProgress.userId, userId),
          eq(userTutorialProgress.tutorialId, tutorialId)
        )
      )
      .returning();

    return {
      ...updated,
      completedSteps: updated.completedSteps as number[],
      answers: updated.answers as Record<string, any>,
      completedAt: updated.completedAt || undefined,
    };
  }

  /**
   * Complete tutorial
   */
  async completeTutorial(userId: string, tutorialId: string): Promise<UserTutorialProgress> {
    const [updated] = await db
      .update(userTutorialProgress)
      .set({
        isCompleted: true,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userTutorialProgress.userId, userId),
          eq(userTutorialProgress.tutorialId, tutorialId)
        )
      )
      .returning();

    return {
      ...updated,
      completedSteps: updated.completedSteps as number[],
      answers: updated.answers as Record<string, any>,
      completedAt: updated.completedAt || undefined,
    };
  }

  /**
   * Validate tutorial step completion
   */
  async validateStepCompletion(
    userId: string,
    tutorialId: string,
    stepIndex: number,
    userInput: any
  ): Promise<{ isValid: boolean; message: string; hints?: string[] }> {
    const tutorial = await this.getTutorialById(tutorialId);
    if (!tutorial) {
      throw new Error("Tutorial not found");
    }

    const step = tutorial.steps[stepIndex];
    if (!step) {
      throw new Error("Step not found");
    }

    const validationRule = tutorial.validationRules.find(rule => rule.stepId === step.id);
    if (!validationRule) {
      // No validation required for this step
      return { isValid: true, message: "Step completed successfully!" };
    }

    // Perform validation based on rule type
    switch (validationRule.type) {
      case 'command':
        return this.validateCommand(userInput, validationRule);
      case 'file':
        return this.validateFile(userInput, validationRule);
      case 'output':
        return this.validateOutput(userInput, validationRule);
      case 'manual':
        return this.validateManual(userInput, validationRule);
      default:
        return { isValid: false, message: "Unknown validation type" };
    }
  }

  private validateCommand(userInput: any, rule: ValidationRule): { isValid: boolean; message: string; hints?: string[] } {
    const expectedCommand = rule.criteria.expectedCommand as string;
    const userCommand = userInput.command as string;

    if (userCommand?.toLowerCase().includes(expectedCommand.toLowerCase())) {
      return { isValid: true, message: rule.successMessage };
    }

    return {
      isValid: false,
      message: rule.failureMessage,
      hints: ["Check the command syntax", "Make sure you're in the correct directory"]
    };
  }

  private validateFile(userInput: any, rule: ValidationRule): { isValid: boolean; message: string; hints?: string[] } {
    const expectedFile = rule.criteria.expectedFile as string;
    const userFiles = userInput.files as string[];

    if (userFiles?.includes(expectedFile)) {
      return { isValid: true, message: rule.successMessage };
    }

    return {
      isValid: false,
      message: rule.failureMessage,
      hints: ["Check if the file was created in the correct location", "Verify the file name and extension"]
    };
  }

  private validateOutput(userInput: any, rule: ValidationRule): { isValid: boolean; message: string; hints?: string[] } {
    const expectedOutput = rule.criteria.expectedOutput as string;
    const userOutput = userInput.output as string;

    if (userOutput?.includes(expectedOutput)) {
      return { isValid: true, message: rule.successMessage };
    }

    return {
      isValid: false,
      message: rule.failureMessage,
      hints: ["Check the command output for the expected text", "Make sure the command executed successfully"]
    };
  }

  private validateManual(userInput: any, rule: ValidationRule): { isValid: boolean; message: string; hints?: string[] } {
    // Manual validation - could involve checking repository state, etc.
    // For now, we'll assume it's valid if user confirms
    const userConfirmed = userInput.confirmed as boolean;

    if (userConfirmed) {
      return { isValid: true, message: rule.successMessage };
    }

    return {
      isValid: false,
      message: rule.failureMessage,
      hints: ["Follow the step instructions carefully", "Check each requirement listed"]
    };
  }

  /**
   * Get tutorial completion statistics
   */
  async getTutorialStats(userId: string): Promise<{
    totalStarted: number;
    totalCompleted: number;
    completionRate: number;
    averageTime: number;
  }> {
    const progress = await this.getUserTutorialProgress(userId);
    const totalStarted = progress.length;
    const totalCompleted = progress.filter(p => p.isCompleted).length;
    const completionRate = totalStarted > 0 ? (totalCompleted / totalStarted) * 100 : 0;

    // Calculate average completion time (simplified)
    const completedTutorials = progress.filter(p => p.isCompleted && p.completedAt);
    const averageTime = completedTutorials.length > 0
      ? completedTutorials.reduce((sum, p) => {
          const startTime = new Date(p.createdAt).getTime();
          const endTime = new Date(p.completedAt!).getTime();
          return sum + (endTime - startTime);
        }, 0) / completedTutorials.length / (1000 * 60) // Convert to minutes
      : 0;

    return {
      totalStarted,
      totalCompleted,
      completionRate: Math.round(completionRate),
      averageTime: Math.round(averageTime),
    };
  }
}
