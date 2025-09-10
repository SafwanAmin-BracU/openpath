import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { IssueRecommenderService } from "~/server/app/matching";
import { RecommendationCard } from "~/components/recommendations";
import type { IssueRecommendation } from "~/server/db/schema";

// Loader to fetch opportunity matches
export const useFetchOpportunityMatches = routeLoader$<IssueRecommendation[]>(
  async (requestEvent) => {
    try {
      // Get user session
      const session = requestEvent.sharedMap.get("session");
      if (!session?.user?.id) {
        console.warn("No authenticated user session found");
        return [];
      }

      const userId = session.user.id;

      // Get user skills and interests from query params or profile
      // In a real implementation, these would come from the user's profile
      const userSkills = requestEvent.url.searchParams.getAll("skill");
      const interests = requestEvent.url.searchParams.getAll("interest");

      // Initialize recommender service
      const recommenderService = new IssueRecommenderService();

      // Get personalized recommendations
      const recommendations = await recommenderService.recommendOpportunities(
        userId,
        userSkills,
        interests,
      );

      return recommendations;
    } catch (error) {
      console.error("Error fetching opportunity matches:", error);
      return [];
    }
  },
);

// Page component
export default component$(() => {
  const opportunityMatches = useFetchOpportunityMatches();

  return (
    <div class="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-100">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="mb-4 text-3xl font-bold text-stone-900 dark:text-stone-100">
            Opportunity Matches
          </h1>
          <p class="text-stone-600 dark:text-stone-400">
            Personalized GitHub issues matching your skills and interests. These
            opportunities are ranked by relevance to help you find the perfect
            contribution.
          </p>
        </div>

        {/* Recommendations */}
        <div class="space-y-6">
          {opportunityMatches.value.length === 0 ? (
            <div class="rounded-lg border border-stone-200 bg-white p-8 text-center shadow-md dark:border-stone-700 dark:bg-stone-800">
              <div class="mb-4">
                <svg
                  class="mx-auto h-12 w-12 text-stone-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 class="mb-2 text-lg font-medium text-stone-900 dark:text-stone-100">
                No recommendations yet
              </h3>
              <p class="text-stone-500 dark:text-stone-400">
                We're analyzing your profile to find the best opportunities.
                Check back soon or update your skills and interests.
              </p>
            </div>
          ) : (
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {opportunityMatches.value.map((recommendation, index) => (
                <RecommendationCard
                  key={`${recommendation.issue.id}-${index}`}
                  recommendation={recommendation}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
