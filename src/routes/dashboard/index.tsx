import { component$ } from "@builder.io/qwik";
import { routeLoader$, routeAction$, zod$ } from "@builder.io/qwik-city";
import { getOctokit } from "~/server/app/octokit";
import { TrackContributionsService } from "~/server/app/portfolio";
import { exportPortfolio } from "~/server/remotes/exportPortfolio.remote";
import { SkillHeatmap } from "~/components/SkillHeatmap";
import { ProjectSummary } from "~/components/ProjectSummary";
import { ActivityTimeline } from "~/components/ActivityTimeline";

// Loader to fetch dashboard data
export const useDashboardData = routeLoader$(async (requestEvent) => {
  try {
    const session = requestEvent.sharedMap.get("session");
    if (!session?.user?.id) {
      throw new Error("Authentication required");
    }

    const octokit = await getOctokit(session);
    const portfolioService = new TrackContributionsService(octokit);

    // Get dashboard data
    const dashboardData = await portfolioService.getDashboardData(
      session.user.id,
    );

    return dashboardData;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      skills: [],
      projects: [],
      timeline: [],
    };
  }
});

// Action to export portfolio
export const useExportPortfolio = routeAction$(
  async (formData, requestEvent) => {
    try {
      const session = requestEvent.sharedMap.get("session");
      if (!session?.user?.id) {
        return {
          success: false,
          error: "Authentication required",
        };
      }

      const format = (formData as any).get("format") as string;
      if (!format || !["pdf", "linkedin"].includes(format)) {
        return {
          success: false,
          error: "Invalid export format",
        };
      }

      const octokit = await getOctokit(session);
      const result = await exportPortfolio(
        {
          userId: session.user.id,
          format: format as "pdf" | "linkedin",
        },
        octokit,
      );

      return result;
    } catch (error) {
      console.error("Error exporting portfolio:", error);
      return {
        success: false,
        error: "Failed to export portfolio",
      };
    }
  },
  zod$({}),
);

// Page component
export default component$(() => {
  const dashboardData = useDashboardData();
  const exportAction = useExportPortfolio();

  return (
    <div class="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-100">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="mb-4 text-3xl font-bold text-stone-900 dark:text-stone-100">
            Growth Dashboard
          </h1>
          <p class="text-stone-600 dark:text-stone-400">
            Visualize your open-source contribution growth and skill development
            over time.
          </p>
        </div>

        {/* Export Actions */}
        <div class="mb-8 flex gap-4">
          <button
            onClick$={async () => {
              const formData = new FormData();
              formData.append("format", "pdf");
              await exportAction.submit(formData);
            }}
            class="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            disabled={exportAction.isRunning}
          >
            {exportAction.isRunning ? (
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
                Generating PDF...
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export as PDF
              </>
            )}
          </button>

          <button
            onClick$={async () => {
              const formData = new FormData();
              formData.append("format", "linkedin");
              await exportAction.submit(formData);
            }}
            class="inline-flex items-center rounded-md border border-stone-300 bg-white px-6 py-3 text-base font-medium text-stone-700 transition-colors hover:bg-stone-50 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
            disabled={exportAction.isRunning}
          >
            <svg class="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Export for LinkedIn
          </button>
        </div>

        {/* Export Results */}
        {exportAction.value?.success && (
          <div class="mb-8 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
            <div class="flex items-center gap-3">
              <svg
                class="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div>
                <p class="font-medium text-emerald-800 dark:text-emerald-200">
                  Export successful!
                </p>
                <p class="text-sm text-emerald-600 dark:text-emerald-400">
                  {exportAction.value.data
                    ? "Your portfolio has been generated."
                    : "Check your downloads folder."}
                </p>
              </div>
            </div>
          </div>
        )}

        {exportAction.value?.error && (
          <div class="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div class="flex items-center gap-3">
              <svg
                class="h-5 w-5 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <div>
                <p class="font-medium text-red-800 dark:text-red-200">
                  Export failed
                </p>
                <p class="text-sm text-red-600 dark:text-red-400">
                  {exportAction.value.error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Skills Heatmap */}
          <div class="lg:col-span-2">
            <SkillHeatmap skills={dashboardData.value.skills} />
          </div>

          {/* Project Summary */}
          <div>
            <ProjectSummary projects={dashboardData.value.projects} />
          </div>

          {/* Activity Timeline */}
          <div>
            <ActivityTimeline timeline={dashboardData.value.timeline} />
          </div>
        </div>
      </div>
    </div>
  );
});
