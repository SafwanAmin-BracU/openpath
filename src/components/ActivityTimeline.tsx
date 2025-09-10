import { component$ } from "@builder.io/qwik";

interface ActivityTimelineProps {
  timeline: Array<{
    date: string;
    count: number;
  }>;
}

export const ActivityTimeline = component$<ActivityTimelineProps>(
  ({ timeline }) => {
    // Fill in missing dates with 0 contributions
    const fillTimeline = () => {
      if (timeline.length === 0) return [];

      const filled = [];
      const startDate = new Date(timeline[0].date);
      const endDate = new Date(timeline[timeline.length - 1].date);

      const timelineMap = new Map(
        timeline.map((item) => [item.date, item.count]),
      );

      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = d.toISOString().split("T")[0];
        filled.push({
          date: dateStr,
          count: timelineMap.get(dateStr) || 0,
        });
      }

      return filled;
    };

    const filledTimeline = fillTimeline();
    const maxCount = Math.max(...filledTimeline.map((t) => t.count), 1);

    const formatDate = (dateStr: string) => {
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return "Invalid date";
        }
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      } catch (error) {
        console.error("Error formatting date:", error);
        return "Invalid date";
      }
    };

    const getActivityColor = (count: number) => {
      const intensity = count / maxCount;
      if (intensity === 0) return "bg-stone-100 dark:bg-stone-700";
      if (intensity <= 0.25) return "bg-emerald-200 dark:bg-emerald-800";
      if (intensity <= 0.5) return "bg-emerald-300 dark:bg-emerald-700";
      if (intensity <= 0.75) return "bg-emerald-400 dark:bg-emerald-600";
      return "bg-emerald-500 dark:bg-emerald-500";
    };

    const getActivityLevel = (count: number) => {
      if (count === 0) return "No activity";
      if (count === 1) return "Light activity";
      if (count <= 3) return "Moderate activity";
      if (count <= 6) return "High activity";
      return "Very high activity";
    };

    return (
      <div class="rounded-lg border border-stone-200 bg-white p-6 shadow-md dark:border-stone-600 dark:bg-stone-800">
        <h2 class="mb-6 text-xl font-semibold text-stone-900 dark:text-stone-100">
          Activity Timeline
        </h2>

        {filledTimeline.length === 0 ? (
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p class="text-stone-500 dark:text-stone-300">
                No activity data available yet
              </p>
              <p class="mt-2 text-sm text-stone-400 dark:text-stone-400">
                Sync your contributions to see your activity timeline
              </p>
            </div>
          </div>
        ) : (
          <div class="space-y-4">
            {/* Activity Grid */}
            <div class="grid grid-cols-7 gap-1">
              {filledTimeline.map((day, index) => (
                <div
                  key={day.date}
                  class={`aspect-square rounded-sm border border-stone-200 transition-all hover:ring-2 hover:ring-emerald-300 dark:border-stone-600 ${getActivityColor(day.count)}`}
                  title={`${formatDate(day.date)}: ${day.count} contributions`}
                />
              ))}
            </div>

            {/* Legend */}
            <div class="flex flex-wrap items-center justify-center gap-4 text-sm text-stone-600 dark:text-stone-300">
              <div class="flex items-center gap-2">
                <div class="h-3 w-3 rounded-sm bg-stone-100 dark:bg-stone-600"></div>
                <span>No activity</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-3 w-3 rounded-sm bg-emerald-200 dark:bg-emerald-700"></div>
                <span>Light</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-3 w-3 rounded-sm bg-emerald-300 dark:bg-emerald-600"></div>
                <span>Moderate</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-3 w-3 rounded-sm bg-emerald-400 dark:bg-emerald-500"></div>
                <span>High</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-3 w-3 rounded-sm bg-emerald-500 dark:bg-emerald-400"></div>
                <span>Very High</span>
              </div>
            </div>

            {/* Summary Stats */}
            <div class="grid grid-cols-2 gap-4 border-t border-stone-200 pt-4 dark:border-stone-600">
              <div class="text-center">
                <div class="text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {filledTimeline.reduce((sum, day) => sum + day.count, 0)}
                </div>
                <div class="text-sm text-stone-600 dark:text-stone-300">
                  Total Contributions
                </div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {Math.round(
                    (filledTimeline.reduce((sum, day) => sum + day.count, 0) /
                      filledTimeline.length) *
                      10,
                  ) / 10}
                </div>
                <div class="text-sm text-stone-600 dark:text-stone-300">
                  Daily Average
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div class="border-t border-stone-200 pt-4 dark:border-stone-600">
              <h3 class="mb-3 font-medium text-stone-900 dark:text-stone-100">
                Recent Activity
              </h3>
              <div class="space-y-2">
                {filledTimeline.slice(-7).map((day) => (
                  <div
                    key={day.date}
                    class="flex items-center justify-between text-sm"
                  >
                    <span class="text-stone-600 dark:text-stone-300">
                      {formatDate(day.date)}
                    </span>
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-stone-900 dark:text-stone-100">
                        {day.count} contributions
                      </span>
                      <span class="text-xs text-stone-500 dark:text-stone-300">
                        ({getActivityLevel(day.count)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);
