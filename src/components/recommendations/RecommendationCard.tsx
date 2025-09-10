import { component$ } from "@builder.io/qwik";
import type { IssueRecommendation } from "~/server/db/schema";

interface RecommendationCardProps {
  recommendation: IssueRecommendation;
}

export const RecommendationCard = component$<RecommendationCardProps>(
  ({ recommendation }) => {
    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case "beginner":
          return "border-green-500 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200";
        case "intermediate":
          return "border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        case "advanced":
          return "border-red-500 bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200";
        default:
          return "border-stone-500 bg-stone-50 text-stone-800 dark:bg-stone-900 dark:text-stone-200";
      }
    };

    const getViabilityColor = (score: number) => {
      if (score >= 8) return "text-green-600 dark:text-green-400";
      if (score >= 6) return "text-yellow-600 dark:text-yellow-400";
      if (score >= 3) return "text-orange-600 dark:text-orange-400";
      return "text-red-600 dark:text-red-400";
    };

    const getViabilityLabel = (score: number) => {
      if (score >= 8) return "Excellent";
      if (score >= 6) return "Good";
      if (score >= 3) return "Fair";
      return "Needs Attention";
    };

    return (
      <article class="rounded-lg border border-stone-200 bg-white p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-stone-700 dark:bg-stone-800">
        {/* Header */}
        <div class="mb-4">
          <div class="mb-2 flex items-start justify-between gap-2">
            <h3 class="flex-1 text-lg font-semibold text-stone-900 dark:text-stone-100">
              <a
                href={recommendation.issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                class="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                {recommendation.issue.title}
              </a>
            </h3>
            <span
              class={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${getDifficultyColor(
                recommendation.difficulty,
              )}`}
            >
              {recommendation.difficulty}
            </span>
          </div>

          <p class="text-sm text-stone-600 dark:text-stone-400">
            {recommendation.repo.full_name} #{recommendation.issue.number}
          </p>
        </div>

        {/* Repository Info */}
        <div class="mb-4">
          <div class="flex flex-wrap items-center gap-2">
            {recommendation.repo.language && (
              <span class="rounded border border-stone-300 bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-300">
                {recommendation.repo.language}
              </span>
            )}
            {recommendation.repo.topics.slice(0, 2).map((topic) => (
              <span
                key={topic}
                class="rounded border border-stone-300 bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-300"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Recommendation Reason */}
        <div class="mb-4">
          <p class="text-sm text-stone-700 dark:text-stone-300">
            <span class="font-medium">Why this matches:</span>{" "}
            {recommendation.reason}
          </p>
        </div>

        {/* Project Viability */}
        <div class="mb-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-stone-600 dark:text-stone-400">
              Project Viability
            </span>
            <div class="flex items-center gap-2">
              <span
                class={`text-lg font-bold ${getViabilityColor(recommendation.projectViability)}`}
              >
                {recommendation.projectViability}/10
              </span>
              <span
                class={`text-xs font-medium ${getViabilityColor(recommendation.projectViability)}`}
              >
                {getViabilityLabel(recommendation.projectViability)}
              </span>
            </div>
          </div>
          <div class="mt-2 flex gap-1">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                class={`h-2 flex-1 rounded-full transition-colors ${
                  i < recommendation.projectViability
                    ? "bg-emerald-500"
                    : "bg-stone-200 dark:bg-stone-600"
                }`}
                title={`${recommendation.projectViability}/10 viability`}
              />
            ))}
          </div>
        </div>

        {/* Labels */}
        {recommendation.issue.labels.length > 0 && (
          <div class="mb-4">
            <div class="flex flex-wrap gap-1">
              {recommendation.issue.labels.slice(0, 3).map((label) => (
                <span
                  key={label}
                  class="inline-flex items-center rounded-full border border-stone-300 bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-300"
                >
                  {label}
                </span>
              ))}
              {recommendation.issue.labels.length > 3 && (
                <span class="text-xs text-stone-400 dark:text-stone-500">
                  +{recommendation.issue.labels.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div class="flex items-center justify-between border-t border-stone-100 pt-2 dark:border-stone-700">
          <span class="text-xs text-stone-500 dark:text-stone-400">
            Created{" "}
            {new Date(recommendation.issue.created_at).toLocaleDateString()}
          </span>
          <a
            href={recommendation.issue.html_url}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            View Issue
            <svg
              class="ml-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </article>
    );
  },
);
