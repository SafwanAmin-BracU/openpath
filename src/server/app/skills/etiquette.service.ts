import { db } from "../../db";
import { etiquetteGuides, userEtiquetteProgress } from "../../db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { EtiquetteGuide, UserEtiquetteProgress, EtiquetteLesson, QuizQuestion } from "../../db/schema";

export class EtiquetteService {
  /**
   * Get all available etiquette guides
   */
  async getAllEtiquetteGuides(): Promise<EtiquetteGuide[]> {
    const result = await db
      .select()
      .from(etiquetteGuides)
      .orderBy(desc(etiquetteGuides.createdAt));

    return result.map(guide => ({
      ...guide,
      lessons: guide.lessons as EtiquetteLesson[],
      quiz: guide.quiz as QuizQuestion[],
      difficulty: guide.difficulty as 'beginner' | 'intermediate' | 'advanced',
    }));
  }

  /**
   * Get etiquette guides by category
   */
  async getEtiquetteGuidesByCategory(category: string): Promise<EtiquetteGuide[]> {
    const result = await db
      .select()
      .from(etiquetteGuides)
      .where(eq(etiquetteGuides.category, category))
      .orderBy(desc(etiquetteGuides.createdAt));

    return result.map(guide => ({
      ...guide,
      lessons: guide.lessons as EtiquetteLesson[],
      quiz: guide.quiz as QuizQuestion[],
      difficulty: guide.difficulty as 'beginner' | 'intermediate' | 'advanced',
    }));
  }

  /**
   * Get etiquette guide by ID
   */
  async getEtiquetteGuideById(guideId: string): Promise<EtiquetteGuide | null> {
    const result = await db
      .select()
      .from(etiquetteGuides)
      .where(eq(etiquetteGuides.id, guideId))
      .limit(1);

    if (!result[0]) return null;

    return {
      ...result[0],
      lessons: result[0].lessons as EtiquetteLesson[],
      quiz: result[0].quiz as QuizQuestion[],
      difficulty: result[0].difficulty as 'beginner' | 'intermediate' | 'advanced',
    };
  }

  /**
   * Get user's etiquette progress
   */
  async getUserEtiquetteProgress(userId: string): Promise<UserEtiquetteProgress[]> {
    const result = await db
      .select()
      .from(userEtiquetteProgress)
      .where(eq(userEtiquetteProgress.userId, userId))
      .orderBy(desc(userEtiquetteProgress.updatedAt));

    return result.map(progress => ({
      ...progress,
      completedLessons: progress.completedLessons as number[],
      quizAnswers: progress.quizAnswers as Record<string, any>,
      quizScore: progress.quizScore || undefined,
      completedAt: progress.completedAt || undefined,
    }));
  }

  /**
   * Get specific etiquette progress for user
   */
  async getUserEtiquetteProgressById(
    userId: string,
    guideId: string
  ): Promise<UserEtiquetteProgress | null> {
    const result = await db
      .select()
      .from(userEtiquetteProgress)
      .where(
        and(
          eq(userEtiquetteProgress.userId, userId),
          eq(userEtiquetteProgress.guideId, guideId)
        )
      )
      .limit(1);

    if (!result[0]) return null;

    return {
      ...result[0],
      completedLessons: result[0].completedLessons as number[],
      quizAnswers: result[0].quizAnswers as Record<string, any>,
      quizScore: result[0].quizScore || undefined,
      completedAt: result[0].completedAt || undefined,
    };
  }

  /**
   * Start or resume etiquette guide for user
   */
  async startEtiquetteGuide(userId: string, guideId: string): Promise<UserEtiquetteProgress> {
    // Check if progress already exists
    const existing = await this.getUserEtiquetteProgressById(userId, guideId);

    if (existing) {
      return existing;
    }

    // Create new progress record
    const [newProgress] = await db
      .insert(userEtiquetteProgress)
      .values({
        userId,
        guideId,
        currentLesson: 0,
        completedLessons: [],
        quizAnswers: {},
        isCompleted: false,
      })
      .returning();

    return {
      ...newProgress,
      completedLessons: newProgress.completedLessons as number[],
      quizAnswers: newProgress.quizAnswers as Record<string, any>,
      quizScore: newProgress.quizScore || undefined,
      completedAt: newProgress.completedAt || undefined,
    };
  }

  /**
   * Update etiquette progress
   */
  async updateEtiquetteProgress(
    userId: string,
    guideId: string,
    lessonIndex: number
  ): Promise<UserEtiquetteProgress> {
    const existing = await this.getUserEtiquetteProgressById(userId, guideId);

    if (!existing) {
      throw new Error("Etiquette progress not found");
    }

    const completedLessons = [...(existing.completedLessons as number[])];
    if (!completedLessons.includes(lessonIndex)) {
      completedLessons.push(lessonIndex);
    }

    const [updated] = await db
      .update(userEtiquetteProgress)
      .set({
        currentLesson: lessonIndex,
        completedLessons,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userEtiquetteProgress.userId, userId),
          eq(userEtiquetteProgress.guideId, guideId)
        )
      )
      .returning();

    return {
      ...updated,
      completedLessons: updated.completedLessons as number[],
      quizAnswers: updated.quizAnswers as Record<string, any>,
      quizScore: updated.quizScore || undefined,
      completedAt: updated.completedAt || undefined,
    };
  }

  /**
   * Submit quiz answers and calculate score
   */
  async submitQuizAnswers(
    userId: string,
    guideId: string,
    answers: Record<string, any>
  ): Promise<{ score: number; passed: boolean; feedback: string }> {
    const guide = await this.getEtiquetteGuideById(guideId);
    if (!guide) {
      throw new Error("Etiquette guide not found");
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = guide.quiz.length;

    for (const question of guide.quiz) {
      const userAnswer = answers[question.id];
      if (this.isAnswerCorrect(userAnswer, question)) {
        correctAnswers++;
      }
    }

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= guide.passingScore;

    // Update progress
    await db
      .update(userEtiquetteProgress)
      .set({
        quizAnswers: answers,
        quizScore: score,
        isCompleted: passed,
        completedAt: passed ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userEtiquetteProgress.userId, userId),
          eq(userEtiquetteProgress.guideId, guideId)
        )
      );

    const feedback = passed
      ? `Congratulations! You passed with ${score}%. You've earned the "Etiquette Master" badge!`
      : `You scored ${score}%. You need ${guide.passingScore}% to pass. Review the material and try again.`;

    return { score, passed, feedback };
  }

  /**
   * Check if quiz answer is correct
   */
  private isAnswerCorrect(userAnswer: any, question: QuizQuestion): boolean {
    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
        return userAnswer === question.correctAnswer;
      case 'short-answer':
        // Simple string matching for short answers
        const correctAnswer = question.correctAnswer as string;
        return userAnswer?.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      default:
        return false;
    }
  }

  /**
   * Complete etiquette guide
   */
  async completeEtiquetteGuide(userId: string, guideId: string): Promise<UserEtiquetteProgress> {
    const [updated] = await db
      .update(userEtiquetteProgress)
      .set({
        isCompleted: true,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userEtiquetteProgress.userId, userId),
          eq(userEtiquetteProgress.guideId, guideId)
        )
      )
      .returning();

    return {
      ...updated,
      completedLessons: updated.completedLessons as number[],
      quizAnswers: updated.quizAnswers as Record<string, any>,
      quizScore: updated.quizScore || undefined,
      completedAt: updated.completedAt || undefined,
    };
  }

  /**
   * Get etiquette completion statistics
   */
  async getEtiquetteStats(userId: string): Promise<{
    totalStarted: number;
    totalCompleted: number;
    completionRate: number;
    averageScore: number;
    passedCount: number;
  }> {
    const progress = await this.getUserEtiquetteProgress(userId);
    const totalStarted = progress.length;
    const totalCompleted = progress.filter(p => p.isCompleted).length;
    const completionRate = totalStarted > 0 ? (totalCompleted / totalStarted) * 100 : 0;

    const completedWithScores = progress.filter(p => p.isCompleted && p.quizScore);
    const averageScore = completedWithScores.length > 0
      ? completedWithScores.reduce((sum, p) => sum + (p.quizScore || 0), 0) / completedWithScores.length
      : 0;

    const passedCount = completedWithScores.filter(p => (p.quizScore || 0) >= 70).length;

    return {
      totalStarted,
      totalCompleted,
      completionRate: Math.round(completionRate),
      averageScore: Math.round(averageScore),
      passedCount,
    };
  }

  /**
   * Get quiz questions for a guide
   */
  async getQuizQuestions(guideId: string): Promise<QuizQuestion[]> {
    const guide = await this.getEtiquetteGuideById(guideId);
    if (!guide) {
      throw new Error("Etiquette guide not found");
    }

    return guide.quiz;
  }

  /**
   * Get lesson content for a guide
   */
  async getLessonContent(guideId: string, lessonIndex: number): Promise<EtiquetteLesson | null> {
    const guide = await this.getEtiquetteGuideById(guideId);
    if (!guide) {
      return null;
    }

    return guide.lessons[lessonIndex] || null;
  }
}
