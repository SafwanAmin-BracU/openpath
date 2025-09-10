import { component$ } from "@builder.io/qwik";

interface ProjectSummaryProps {
  projects: Array<{
    repoName: string;
    repoOwner: string;
    prCount: number;
    totalLines: number;
    lastContribution: Date;
  }>;
}

export const ProjectSummary = component$<ProjectSummaryProps>(
  ({ projects }) => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const getRankIcon = (index: number) => {
      switch (index) {
        case 0:
          return "🥇";
        case 1:
          return "🥈";
        case 2:
          return "🥉";
        default:
          return "🏅";
      }
    };

    const getRankColor = (index: number) => {
      switch (index) {
        case 0:
          return "border-yellow-300 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20";
        case 1:
          return "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/20";
        case 2:
          return "border-orange-300 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/20";
        default:
          return "border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800";
      }
    };

    return (
      <div class="rounded-lg border border-stone-200 bg-white p-6 shadow-md dark:border-stone-700 dark:bg-stone-800">
        <h2 class="mb-6 text-xl font-semibold text-stone-900 dark:text-stone-100">
          Top Projects
        </h2>

        {projects.length === 0 ? (
          <div class="flex h-64 items-center justify-center">
            <div class="text-center">
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
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
                  />
                </svg>
              </div>
              <p class="text-stone-500 dark:text-stone-400">
                No project data available yet
              </p>
              <p class="mt-2 text-sm text-stone-400 dark:text-stone-500">
                Sync your contributions to see your top projects
              </p>
            </div>
          </div>
        ) : (
          <div class="space-y-4">
            {projects.slice(0, 5).map((project, index) => (
              <div
                key={`${project.repoOwner}/${project.repoName}`}
                class={`rounded-lg border p-4 transition-all hover:shadow-md ${getRankColor(index)}`}
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="mb-2 flex items-center gap-2">
                      <span class="text-2xl">{getRankIcon(index)}</span>
                      <div>
                        <h3 class="font-semibold text-stone-900 dark:text-stone-100">
                          {project.repoOwner}/{project.repoName}
                        </h3>
                        <p class="text-sm text-stone-600 dark:text-stone-400">
                          Last contribution:{" "}
                          {formatDate(project.lastContribution)}
                        </p>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 text-sm">
                      <div class="rounded bg-stone-100 p-2 dark:bg-stone-700">
                        <div class="font-medium text-stone-900 dark:text-stone-100">
                          {project.prCount}
                        </div>
                        <div class="text-stone-600 dark:text-stone-400">
                          Pull Requests
                        </div>
                      </div>
                      <div class="rounded bg-stone-100 p-2 dark:bg-stone-700">
                        <div class="font-medium text-stone-900 dark:text-stone-100">
                          {project.totalLines.toLocaleString()}
                        </div>
                        <div class="text-stone-600 dark:text-stone-400">
                          Lines Changed
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar based on PR count */}
                  <div class="ml-4 w-16">
                    <div class="mb-1 text-right text-xs text-stone-500 dark:text-stone-400">
                      {Math.round(
                        (project.prCount / projects[0].prCount) * 100,
                      )}
                      %
                    </div>
                    <div class="h-2 w-full rounded-full bg-stone-200 dark:bg-stone-700">
                      <div
                        class="h-full rounded-full bg-emerald-500 transition-all"
                        style={{
                          width: `${Math.max(10, (project.prCount / projects[0].prCount) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {projects.length > 5 && (
              <div class="text-center">
                <p class="text-sm text-stone-500 dark:text-stone-400">
                  And {projects.length - 5} more projects...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);
