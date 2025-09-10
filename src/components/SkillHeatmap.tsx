import { component$ } from "@builder.io/qwik";

interface SkillHeatmapProps {
  skills: Array<{
    name: string;
    category: string;
    totalLines: number;
    prCount: number;
    proficiency: number;
  }>;
}

export const SkillHeatmap = component$<SkillHeatmapProps>(({ skills }) => {
  // Calculate max values for scaling
  const maxLines = Math.max(...skills.map((s) => s.totalLines), 1);
  const maxPRs = Math.max(...skills.map((s) => s.prCount), 1);

  const getHeatmapColor = (intensity: number) => {
    if (intensity >= 0.8) return "bg-emerald-600";
    if (intensity >= 0.6) return "bg-emerald-500";
    if (intensity >= 0.4) return "bg-emerald-400";
    if (intensity >= 0.2) return "bg-emerald-300";
    return "bg-emerald-200";
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "language":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "framework":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "tool":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div class="rounded-lg border border-stone-200 bg-white p-6 shadow-md dark:border-stone-700 dark:bg-stone-800">
      <h2 class="mb-6 text-xl font-semibold text-stone-900 dark:text-stone-100">
        Skills Heatmap
      </h2>

      {skills.length === 0 ? (
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p class="text-stone-500 dark:text-stone-400">
              No skills data available yet
            </p>
            <p class="mt-2 text-sm text-stone-400 dark:text-stone-500">
              Sync your contributions to see your skills heatmap
            </p>
          </div>
        </div>
      ) : (
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => {
            const linesIntensity = skill.totalLines / maxLines;
            const prsIntensity = skill.prCount / maxPRs;
            const overallIntensity = (linesIntensity + prsIntensity) / 2;

            return (
              <div
                key={skill.name}
                class={`relative rounded-lg p-4 transition-all hover:scale-105 ${getHeatmapColor(overallIntensity)}`}
              >
                <div class="relative z-10">
                  <div class="mb-2 flex items-center justify-between">
                    <h3 class="font-semibold text-white">{skill.name}</h3>
                    <span
                      class={`rounded px-2 py-1 text-xs font-medium ${getCategoryColor(skill.category)}`}
                    >
                      {skill.category}
                    </span>
                  </div>

                  <div class="space-y-2 text-sm text-white/90">
                    <div class="flex justify-between">
                      <span>Lines of Code:</span>
                      <span class="font-medium">
                        {skill.totalLines.toLocaleString()}
                      </span>
                    </div>
                    <div class="flex justify-between">
                      <span>PR Count:</span>
                      <span class="font-medium">{skill.prCount}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Proficiency:</span>
                      <span class="font-medium">
                        Level {skill.proficiency}/10
                      </span>
                    </div>
                  </div>

                  {/* Heat intensity indicator */}
                  <div class="mt-3 h-2 w-full rounded-full bg-white/20">
                    <div
                      class="h-full rounded-full bg-white/60 transition-all"
                      style={{ width: `${overallIntensity * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      {skills.length > 0 && (
        <div class="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-stone-600 dark:text-stone-400">
          <div class="flex items-center gap-2">
            <div class="h-3 w-3 rounded bg-emerald-200"></div>
            <span>Low Activity</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="h-3 w-3 rounded bg-emerald-400"></div>
            <span>Medium Activity</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="h-3 w-3 rounded bg-emerald-600"></div>
            <span>High Activity</span>
          </div>
        </div>
      )}
    </div>
  );
});
