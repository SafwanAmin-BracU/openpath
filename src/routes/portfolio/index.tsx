import { component$ } from "@builder.io/qwik";
import { routeLoader$, routeAction$, zod$ } from "@builder.io/qwik-city";
import { getOctokit } from "~/server/app/octokit";
import { TrackContributionsService } from "~/server/app/portfolio";
import type { Contribution } from "~/server/db/schema";

// Loader to fetch contribution portfolio
export const useContributionPortfolio = routeLoader$(async (requestEvent) => {
  try {
    const session = requestEvent.sharedMap.get("session");
    if (!session?.user?.id) {
      throw new Error("Authentication required");
    }

    const octokit = await getOctokit(session);
    const portfolioService = new TrackContributionsService(octokit);

    // Get contribution portfolio
    const portfolio = await portfolioService.getContributionPortfolio(
      session.user.id,
    );

    return portfolio;
  } catch (error) {
    console.error("Error fetching contribution portfolio:", error);
    return {
      contributions: [],
      skills: [],
      stats: {
        totalContributions: 0,
        totalAdditions: 0,
        totalDeletions: 0,
        topLanguages: [],
      },
    };
  }
});

// Action to sync contributions from GitHub
export const useSyncContributions = routeAction$(async (_, requestEvent) => {
  try {
    const session = requestEvent.sharedMap.get("session");
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const octokit = await getOctokit(session);
    const portfolioService = new TrackContributionsService(octokit);

    // Sync contributions from GitHub
    await portfolioService.syncAcceptedPRs(session.user.id);

    return {
      success: true,
      message: "Contributions synced successfully",
    };
  } catch (error) {
    console.error("Error syncing contributions:", error);
    return {
      success: false,
      error: "Failed to sync contributions",
    };
  }
}, zod$({}));

// Page component
export default component$(() => {
  const portfolio = useContributionPortfolio();
  const syncAction = useSyncContributions();

  return (
    <div class="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-100">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="mb-4 text-3xl font-bold text-stone-900 dark:text-stone-100">
            Contribution Portfolio
          </h1>
          <p class="text-stone-600 dark:text-stone-400">
            Track your open-source contributions and skills development over
            time.
          </p>
        </div>

        {/* Sync Button */}
        <div class="mb-8">
          <button
            onClick$={async () => await syncAction.submit({})}
            class="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            disabled={syncAction.isRunning}
          >
            {syncAction.isRunning ? (
              <>
                <svg
                  class="mr-2 h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Syncing...
              </>
            ) : (
              <>
                <svg
                  class="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Sync from GitHub
              </>
            )}
          </button>
          {syncAction.value?.success && (
            <p class="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
              {syncAction.value.message}
            </p>
          )}
          {syncAction.value?.error && (
            <p class="mt-2 text-sm text-red-600 dark:text-red-400">
              {syncAction.value.error}
            </p>
          )}
        </div>

        {/* Stats Overview */}
        <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Contributions"
            value={portfolio.value.stats.totalContributions.toString()}
            icon="📊"
          />
          <StatCard
            title="Lines Added"
            value={portfolio.value.stats.totalAdditions.toLocaleString()}
            icon="➕"
          />
          <StatCard
            title="Lines Removed"
            value={portfolio.value.stats.totalDeletions.toLocaleString()}
            icon="➖"
          />
          <StatCard
            title="Skills Detected"
            value={portfolio.value.skills.length.toString()}
            icon="🎯"
          />
        </div>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Top Languages */}
          <div class="rounded-lg border border-stone-200 bg-white p-6 shadow-md dark:border-stone-700 dark:bg-stone-800">
            <h2 class="mb-4 text-xl font-semibold text-stone-900 dark:text-stone-100">
              Top Languages
            </h2>
            {portfolio.value.stats.topLanguages.length === 0 ? (
              <p class="text-stone-500 dark:text-stone-400">
                No language data available
              </p>
            ) : (
              <div class="space-y-3">
                {portfolio.value.stats.topLanguages.map((lang, index) => (
                  <div
                    key={lang.name}
                    class="flex items-center justify-between"
                  >
                    <div class="flex items-center gap-3">
                      <span class="text-2xl">
                        {index === 0
                          ? "🥇"
                          : index === 1
                            ? "🥈"
                            : index === 2
                              ? "🥉"
                              : "🏅"}
                      </span>
                      <span class="font-medium text-stone-900 dark:text-stone-100">
                        {lang.name}
                      </span>
                    </div>
                    <span class="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700 dark:bg-stone-700 dark:text-stone-300">
                      {lang.count} PRs
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills Overview */}
          <div class="rounded-lg border border-stone-200 bg-white p-6 shadow-md dark:border-stone-700 dark:bg-stone-800">
            <h2 class="mb-4 text-xl font-semibold text-stone-900 dark:text-stone-100">
              Skills Overview
            </h2>
            {portfolio.value.skills.length === 0 ? (
              <p class="text-stone-500 dark:text-stone-400">
                No skills detected yet
              </p>
            ) : (
              <div class="space-y-3">
                {portfolio.value.skills.slice(0, 8).map((skill) => (
                  <div key={skill.id} class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="h-3 w-3 rounded-full bg-emerald-500"></div>
                      <span class="font-medium text-stone-900 dark:text-stone-100">
                        {skill.name}
                      </span>
                      <span class="rounded bg-stone-100 px-2 py-1 text-xs text-stone-600 dark:bg-stone-700 dark:text-stone-400">
                        {skill.category}
                      </span>
                    </div>
                    <div class="text-right">
                      <div class="text-sm font-medium text-stone-900 dark:text-stone-100">
                        Level {skill.proficiency}/10
                      </div>
                      <div class="text-xs text-stone-500 dark:text-stone-400">
                        {skill.totalContributions} contributions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Contributions */}
        <div class="mt-8">
          <h2 class="mb-6 text-2xl font-semibold text-stone-900 dark:text-stone-100">
            Recent Contributions
          </h2>
          {portfolio.value.contributions.length === 0 ? (
            <div class="rounded-lg border border-stone-200 bg-white p-8 text-center shadow-md dark:border-stone-700 dark:bg-stone-800">
              <div class="mb-4">
                <svg
                  class="mx-auto h-12 w-12 text-stone-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 class="mb-2 text-lg font-medium text-stone-900 dark:text-stone-100">
                No contributions yet
              </h3>
              <p class="text-stone-600 dark:text-stone-400">
                Sync your GitHub contributions to see your portfolio here.
              </p>
            </div>
          ) : (
            <div class="space-y-4">
              {portfolio.value.contributions
                .slice(0, 10)
                .map((contribution) => (
                  <ContributionCard
                    key={contribution.id}
                    contribution={contribution}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Stat Card Component
const StatCard = component$<{ title: string; value: string; icon: string }>(
  ({ title, value, icon }) => {
    return (
      <div class="rounded-lg border border-stone-200 bg-white p-6 shadow-md dark:border-stone-700 dark:bg-stone-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-stone-600 dark:text-stone-400">
              {title}
            </p>
            <p class="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {value}
            </p>
          </div>
          <div class="text-3xl">{icon}</div>
        </div>
      </div>
    );
  },
);

// Contribution Card Component
const ContributionCard = component$<{ contribution: Contribution }>(
  ({ contribution }) => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    return (
      <div class="rounded-lg border border-stone-200 bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:border-stone-700 dark:bg-stone-800">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex-1">
            <h3 class="mb-2 text-lg font-semibold text-stone-900 dark:text-stone-100">
              <a
                href={contribution.url}
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                {contribution.title}
              </a>
            </h3>
            <p class="mb-3 text-sm text-stone-600 dark:text-stone-400">
              {contribution.repositoryOwner}/{contribution.repositoryName} #
              {contribution.prNumber}
            </p>

            <div class="flex flex-wrap items-center gap-4 text-sm text-stone-500 dark:text-stone-400">
              <span>Merged {formatDate(contribution.mergedAt)}</span>
              <span>
                +{contribution.additions.toLocaleString()} -
                {contribution.deletions.toLocaleString()}
              </span>
              <span>{contribution.changedFiles} files</span>
              {contribution.primaryLanguage && (
                <span class="rounded border border-stone-300 bg-stone-100 px-2 py-1 dark:border-stone-600 dark:bg-stone-700">
                  {contribution.primaryLanguage}
                </span>
              )}
            </div>

            {contribution.labels.length > 0 && (
              <div class="mt-3 flex flex-wrap gap-1">
                {contribution.labels.slice(0, 5).map((label) => (
                  <span
                    key={label}
                    class="rounded-full border border-stone-300 bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-300"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div class="flex items-center gap-2">
            <a
              href={contribution.url}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
            >
              <svg
                class="mr-2 h-4 w-4"
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
              View PR
            </a>
          </div>
        </div>
      </div>
    );
  },
);
