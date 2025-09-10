import { component$ } from "@builder.io/qwik";
import { routeLoader$, routeAction$, zod$, z } from "@builder.io/qwik-city";
import { TutorialsService } from "../../server/app/skills/tutorials.service";
import { BadgeService } from "../../server/app/skills/badge.service";
import { EtiquetteService } from "../../server/app/skills/etiquette.service";

// Initialize services
const tutorialsService = new TutorialsService();
const badgeService = new BadgeService();
const etiquetteService = new EtiquetteService();

// Loaders
export const useFetchSkillTutorials = routeLoader$(async () => {
  try {
    const tutorials = await tutorialsService.getAllTutorials();
    return { tutorials, error: null };
  } catch (error) {
    console.error("Error fetching tutorials:", error);
    return { tutorials: [], error: "Failed to load tutorials" };
  }
});

export const useFetchUserBadges = routeLoader$(async ({ sharedMap }) => {
  try {
    const userId = sharedMap.get("userId") as string;
    if (!userId)
      return { badges: [], stats: null, error: "User not authenticated" };

    const [badges, stats] = await Promise.all([
      badgeService.getUserBadges(userId),
      badgeService.getUserBadgeStats(userId),
    ]);

    return { badges, stats, error: null };
  } catch (error) {
    console.error("Error fetching user badges:", error);
    return { badges: [], stats: null, error: "Failed to load badges" };
  }
});

export const useFetchEtiquetteCourse = routeLoader$(async () => {
  try {
    const guides = await etiquetteService.getAllEtiquetteGuides();
    return { guides, error: null };
  } catch (error) {
    console.error("Error fetching etiquette guides:", error);
    return { guides: [], error: "Failed to load etiquette guides" };
  }
});

// Actions
export const useSubmitMilestoneCompletion = routeAction$(
  async (data, { sharedMap }) => {
    try {
      const userId = sharedMap.get("userId") as string;
      if (!userId) return { success: false, error: "User not authenticated" };

      const { milestoneType, milestoneValue } = data;

      // Award badges for milestone completion
      const awardedBadges = await badgeService.checkAndAwardBadges(userId, {
        type: "milestone",
        target: milestoneValue,
        context: { milestoneType },
      });

      return {
        success: true,
        awardedBadges,
        message: `Milestone "${milestoneValue}" completed!`,
      };
    } catch (error) {
      console.error("Error submitting milestone completion:", error);
      return { success: false, error: "Failed to complete milestone" };
    }
  },
  zod$({
    milestoneType: z.string(),
    milestoneValue: z.string(),
  }),
);

export const useSubmitEtiquetteQuiz = routeAction$(
  async (data, { sharedMap }) => {
    try {
      const userId = sharedMap.get("userId") as string;
      if (!userId) return { success: false, error: "User not authenticated" };

      const { guideId, answers } = data;

      // Submit quiz answers
      const result = await etiquetteService.submitQuizAnswers(
        userId,
        guideId,
        answers,
      );

      // Award etiquette master badge if passed
      let awardedBadges: any[] = [];
      if (result.passed) {
        awardedBadges = await badgeService.checkAndAwardBadges(userId, {
          type: "tutorial_completion",
          target: "etiquette_master",
          context: { guideId, score: result.score },
        });
      }

      return {
        success: true,
        result,
        awardedBadges,
        message: result.feedback,
      };
    } catch (error) {
      console.error("Error submitting etiquette quiz:", error);
      return { success: false, error: "Failed to submit quiz" };
    }
  },
  zod$({
    guideId: z.string(),
    answers: z.record(z.any()),
  }),
);

// Main component
export default component$(() => {
  const tutorials = useFetchSkillTutorials();
  const userBadges = useFetchUserBadges();
  const etiquetteGuides = useFetchEtiquetteCourse();

  const submitMilestoneCompletion = useSubmitMilestoneCompletion();
  const submitEtiquetteQuiz = useSubmitEtiquetteQuiz();

  return (
    <div class="bg-base-200 min-h-screen">
      <div class="container mx-auto px-4 py-8">
        {/* Header */}
        <div class="mb-8 text-center">
          <h1 class="text-primary mb-4 text-4xl font-bold">
            Open Source Skills Development
          </h1>
          <p class="text-base-content/70 mx-auto max-w-2xl text-lg">
            Master version control, pull requests, and open source etiquette
            through interactive tutorials and hands-on practice.
          </p>
        </div>

        {/* Main Content Grid */}
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Tutorials Section */}
          <div class="lg:col-span-2">
            <TutorialsSection tutorials={tutorials.value} />
          </div>

          {/* Sidebar */}
          <div class="space-y-6">
            <BadgePanel
              badges={userBadges.value}
              onMilestoneComplete={submitMilestoneCompletion}
            />
            <EtiquetteSection
              guides={etiquetteGuides.value}
              onSubmitQuiz={submitEtiquetteQuiz}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

// Tutorials Section Component
export const TutorialsSection = component$<{
  tutorials: { tutorials: any[]; error: string | null };
}>(({ tutorials }) => {
  return (
    <div class="bg-base-100 rounded-lg p-6 shadow-lg">
      <h2 class="mb-6 flex items-center gap-2 text-2xl font-bold">
        <span class="text-2xl">📚</span>
        Interactive Tutorials
      </h2>

      {tutorials.error && (
        <div class="alert alert-error mb-4">
          <span>{tutorials.error}</span>
        </div>
      )}

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        {tutorials.tutorials?.map((tutorial) => (
          <TutorialCard key={tutorial.id} tutorial={tutorial} />
        ))}
      </div>
    </div>
  );
});

// Tutorial Card Component
export const TutorialCard = component$<{
  tutorial: any;
}>(({ tutorial }) => {
  return (
    <div class="bg-base-200 rounded-lg p-4 transition-shadow hover:shadow-md">
      <div class="mb-3 flex items-start justify-between">
        <h3 class="text-lg font-semibold">{tutorial.title}</h3>
        <span class={`badge badge-${getDifficultyColor(tutorial.difficulty)}`}>
          {tutorial.difficulty}
        </span>
      </div>

      <p class="text-base-content/70 mb-4 text-sm">{tutorial.description}</p>

      <div class="flex items-center justify-between">
        <span class="text-base-content/60 text-sm">
          ⏱️ {tutorial.estimatedTime} min
        </span>
        <button
          class="btn btn-primary btn-sm"
          onClick$={() => {
            // TODO: Implement tutorial start functionality
            console.log("Starting tutorial:", tutorial.id);
            // Future: onSubmitAnswer({ tutorialId: tutorial.id, stepIndex: 0, answers: {} });
          }}
        >
          Start Tutorial
        </button>
      </div>
    </div>
  );
});

// Badge Panel Component
export const BadgePanel = component$<{
  badges: { badges: any[]; stats: any; error: string | null };
  onMilestoneComplete: any;
}>(({ badges, onMilestoneComplete }) => {
  return (
    <div class="bg-base-100 rounded-lg p-6 shadow-lg">
      <h3 class="mb-4 flex items-center gap-2 text-xl font-bold">
        <span class="text-xl">🏆</span>
        Your Badges
      </h3>

      {badges.error && (
        <div class="alert alert-error mb-4">
          <span>{badges.error}</span>
        </div>
      )}

      {badges.stats && (
        <div class="stats stats-vertical mb-4 w-full">
          <div class="stat">
            <div class="stat-title">Total Earned</div>
            <div class="stat-value text-primary">
              {badges.stats.totalEarned}
            </div>
          </div>
          <div class="stat">
            <div class="stat-title">Completion Rate</div>
            <div class="stat-value text-secondary">
              {badges.stats.completionRate}%
            </div>
          </div>
        </div>
      )}

      <div class="grid grid-cols-2 gap-2">
        {badges.badges
          ?.slice(0, 6)
          .map((userBadge) => (
            <BadgeItem key={userBadge.id} userBadge={userBadge} />
          ))}
      </div>

      {/* Hidden milestone completion trigger for future use */}
      <div class="hidden">
        {onMilestoneComplete && "Milestone completion handler available"}
      </div>
    </div>
  );
});

// Badge Item Component
export const BadgeItem = component$<{ userBadge: any }>(({ userBadge }) => {
  return (
    <div class="bg-base-200 hover:bg-base-300 rounded-lg p-3 text-center transition-colors">
      <div class="mb-1 text-2xl">{userBadge.badge?.icon || "🏆"}</div>
      <div class="text-xs font-medium">{userBadge.badge?.name}</div>
    </div>
  );
});

// Etiquette Section Component
export const EtiquetteSection = component$<{
  guides: { guides: any[]; error: string | null };
  onSubmitQuiz: any;
}>(({ guides, onSubmitQuiz }) => {
  return (
    <div class="bg-base-100 rounded-lg p-6 shadow-lg">
      <h3 class="mb-4 flex items-center gap-2 text-xl font-bold">
        <span class="text-xl">🤝</span>
        Open Source Etiquette
      </h3>

      {guides.error && (
        <div class="alert alert-error mb-4">
          <span>{guides.error}</span>
        </div>
      )}

      <div class="space-y-3">
        {guides.guides?.map((guide) => (
          <EtiquetteGuideCard
            key={guide.id}
            guide={guide}
            onSubmitQuiz={onSubmitQuiz}
          />
        ))}
      </div>
    </div>
  );
});

// Etiquette Guide Card Component
export const EtiquetteGuideCard = component$<{
  guide: any;
  onSubmitQuiz: any;
}>(({ guide, onSubmitQuiz }) => {
  return (
    <div class="bg-base-200 rounded-lg p-4 transition-shadow hover:shadow-md">
      <h4 class="mb-2 font-medium">{guide.title}</h4>
      <p class="text-base-content/70 mb-3 text-sm">{guide.description}</p>

      <div class="flex items-center justify-between">
        <span class="text-base-content/60 text-xs">
          📖 {guide.lessons?.length || 0} lessons
        </span>
        <button
          class="btn btn-secondary btn-xs"
          onClick$={() => {
            // TODO: Implement etiquette guide start functionality
            console.log("Starting etiquette guide:", guide.id);
          }}
        >
          Start Guide
        </button>
      </div>

      {/* Hidden quiz submission trigger for future use */}
      <div class="hidden">
        {onSubmitQuiz && "Quiz submission handler available"}
      </div>
    </div>
  );
});

// Utility function
function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "beginner":
      return "success";
    case "intermediate":
      return "warning";
    case "advanced":
      return "error";
    default:
      return "neutral";
  }
}
