import { component$ } from "@builder.io/qwik";
import {
  routeLoader$,
  routeAction$,
  zod$,
  z,
  Form,
} from "@builder.io/qwik-city";
import { getOctokit } from "~/server/app/octokit";
import { GitHubFilterService } from "~/server/app/github-filter";
import { GitHubCacheService } from "~/server/db/github-cache";
import type { FilterCriteria, FilterResult } from "~/server/db/schema";

// Constants

// Zod validation schemas
const filterSchema = z.object({
  language: z.string().optional(),
  topic: z.string().optional(),
});

// Loaders
export const useFetchGitHubIssues = routeLoader$<FilterResult>(
  async (requestEvent) => {
    try {
      // Get authenticated Octokit instance
      const session = requestEvent.sharedMap.get("session");
      if (!session?.user?.id) {
        throw new Error("Authentication required");
      }

      const octokit = await getOctokit(session);
      const filterService = new GitHubFilterService(octokit);

      // Get filter criteria from URL params
      const language =
        requestEvent.url.searchParams.get("language") || undefined;
      const topic = requestEvent.url.searchParams.get("topic") || undefined;

      const criteria: FilterCriteria = {
        language: language || null,
        topic: topic || null,
        session_id: session.user.id,
      };

      // Try cache first
      const cacheKey = GitHubCacheService.generateCacheKey(criteria);
      let result = await GitHubCacheService.getCachedIssues(cacheKey);

      if (!result) {
        // Fetch from GitHub API - we need to create a custom fetch since the service expects different criteria
        const issues = await filterService.fetchFromGitHubAPI(criteria);
        result = {
          issues,
          total_count: issues.length,
          filter_applied: criteria,
          cache_timestamp: new Date().toISOString(),
          is_from_cache: false,
        };

        // Cache the result
        await GitHubCacheService.cacheIssues(cacheKey, issues);
      }

      return result;
    } catch (error) {
      console.error("Error fetching GitHub issues:", error);
      return {
        issues: [],
        total_count: 0,
        filter_applied: {
          language: null,
          topic: null,
          session_id: "",
        },
        cache_timestamp: new Date().toISOString(),
        is_from_cache: false,
      };
    }
  },
);

export const useAvailableLanguages = routeLoader$<string[]>(async () => {
  try {
    // For now, return predefined languages
    // In production, this could be fetched from GitHub API or cached
    return [
      "javascript",
      "typescript",
      "python",
      "java",
      "csharp",
      "cpp",
      "c",
      "ruby",
      "php",
      "go",
      "rust",
      "swift",
      "kotlin",
      "scala",
      "r",
      "shell",
      "powershell",
      "html",
      "css",
      "vue",
      "react",
      "angular",
    ];
  } catch (error) {
    console.error("Error fetching available languages:", error);
    return [];
  }
});

export const useAvailableTopics = routeLoader$<string[]>(async () => {
  try {
    // For now, return predefined topics
    // In production, this could be fetched from GitHub API or cached
    return [
      "web-development",
      "mobile-development",
      "data-science",
      "machine-learning",
      "devops",
      "security",
      "testing",
      "documentation",
      "bug",
      "enhancement",
      "help-wanted",
      "good-first-issue",
      "hacktoberfest",
      "frontend",
      "backend",
      "fullstack",
      "api",
      "database",
      "cloud",
      "microservices",
    ];
  } catch (error) {
    console.error("Error fetching available topics:", error);
    return [];
  }
});

// Actions
export const useSubmitFilterUpdate = routeAction$(
  async (data, requestEvent) => {
    try {
      const session = requestEvent.sharedMap.get("session");
      if (!session?.user?.id) {
        return {
          success: false,
          error: "Authentication required",
        };
      }

      // Validate input
      const validatedData = filterSchema.parse(data);

      // Redirect with new filter parameters
      const url = new URL(requestEvent.url);
      if (validatedData.language) {
        url.searchParams.set("language", validatedData.language);
      } else {
        url.searchParams.delete("language");
      }

      if (validatedData.topic) {
        url.searchParams.set("topic", validatedData.topic);
      } else {
        url.searchParams.delete("topic");
      }

      // Clear cache for this filter combination
      const criteria: FilterCriteria = {
        language: validatedData.language || null,
        topic: validatedData.topic || null,
        session_id: session.user.id,
      };

      const cacheKey = GitHubCacheService.generateCacheKey(criteria);
      await GitHubCacheService.refreshCache(cacheKey);

      return {
        success: true,
        redirectUrl: url.pathname + url.search,
      };
    } catch (error) {
      console.error("Error updating filter:", error);
      return {
        success: false,
        error: "Failed to update filter",
      };
    }
  },
  zod$({
    language: z.string().optional(),
    topic: z.string().optional(),
  }),
);

// Page component
export default component$(() => {
  const issuesData = useFetchGitHubIssues();
  const availableLanguages = useAvailableLanguages();
  const availableTopics = useAvailableTopics();
  const filterAction = useSubmitFilterUpdate();

  return (
    <div class="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-100">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="mb-4 text-3xl font-bold text-stone-900 dark:text-stone-100">
            GitHub Issues Filter
          </h1>
          <p class="text-stone-600 dark:text-stone-400">
            Filter GitHub issues by programming language and repository topics
            to find opportunities that match your skills.
          </p>
        </div>

        {/* Filter Controls */}
        <div class="mb-8 rounded-lg border border-stone-200 bg-white p-6 shadow-md dark:border-stone-700 dark:bg-stone-800">
          <h2 class="mb-4 text-xl font-semibold text-stone-900 dark:text-stone-100">
            Filters
          </h2>

          <Form
            action={filterAction}
            class="grid grid-cols-1 gap-4 md:grid-cols-2"
            aria-label="GitHub Issues Filter Form"
          >
            {/* Language Filter */}
            <div>
              <label
                for="language"
                class="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300"
              >
                Programming Language
              </label>
              <select
                id="language"
                name="language"
                class="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
                aria-describedby="language-help"
              >
                <option
                  value=""
                  class="bg-white text-stone-900 dark:bg-stone-700 dark:text-stone-100"
                >
                  All Languages
                </option>
                {availableLanguages.value.map((lang) => (
                  <option
                    key={lang}
                    value={lang}
                    class="bg-white text-stone-900 dark:bg-stone-700 dark:text-stone-100"
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
              <div id="language-help" class="sr-only">
                Select a programming language to filter GitHub issues
              </div>
            </div>

            {/* Topic Filter */}
            <div>
              <label
                for="topic"
                class="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300"
              >
                Repository Topic
              </label>
              <select
                id="topic"
                name="topic"
                class="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
                aria-describedby="topic-help"
              >
                <option
                  value=""
                  class="bg-white text-stone-900 dark:bg-stone-700 dark:text-stone-100"
                >
                  All Topics
                </option>
                {availableTopics.value.map((topic) => (
                  <option
                    key={topic}
                    value={topic}
                    class="bg-white text-stone-900 dark:bg-stone-700 dark:text-stone-100"
                  >
                    {topic
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}
                  </option>
                ))}
              </select>
              <div id="topic-help" class="sr-only">
                Select a repository topic to filter GitHub issues
              </div>
            </div>

            {/* Submit Button */}
            <div class="md:col-span-2">
              <button
                type="submit"
                class="w-full rounded-md bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 sm:w-auto"
                disabled={filterAction.isRunning}
                aria-describedby="submit-help"
              >
                {filterAction.isRunning
                  ? "Applying Filters..."
                  : "Apply Filters"}
              </button>
              <div id="submit-help" class="sr-only">
                Apply the selected filters to search GitHub issues
              </div>
            </div>
          </Form>

          {/* Filter Status */}
          {issuesData.value.filter_applied.language && (
            <div class="mt-4 text-sm text-stone-600 dark:text-stone-400">
              <span class="font-medium text-stone-900 dark:text-stone-100">
                Active Filters:
              </span>
              {issuesData.value.filter_applied.language && (
                <span class="ml-2 inline-flex items-center rounded-full border border-emerald-700 bg-emerald-900 px-2.5 py-0.5 text-xs font-medium text-emerald-200">
                  Language: {issuesData.value.filter_applied.language}
                </span>
              )}
              {issuesData.value.filter_applied.topic && (
                <span class="ml-2 inline-flex items-center rounded-full border border-emerald-600 bg-emerald-800 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                  Topic: {issuesData.value.filter_applied.topic}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div class="rounded-lg border border-stone-200 bg-white p-4 shadow-md sm:p-6 dark:border-stone-700 dark:bg-stone-800">
          <div class="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <h2 class="text-lg font-semibold text-stone-900 sm:text-xl dark:text-stone-100">
              Issues ({issuesData.value.total_count})
            </h2>
            {issuesData.value.is_from_cache && (
              <span class="text-sm text-stone-500 dark:text-stone-400">
                Cached •{" "}
                {new Date(issuesData.value.cache_timestamp).toLocaleString()}
              </span>
            )}
          </div>

          {issuesData.value.issues.length === 0 ? (
            <div class="py-8 text-center">
              <p class="text-stone-500 dark:text-stone-400">
                No issues found matching your criteria.
              </p>
              <p class="mt-2 text-sm text-stone-400 dark:text-stone-500">
                Try adjusting your filters or check back later.
              </p>
            </div>
          ) : (
            <div class="space-y-3 sm:space-y-4">
              {issuesData.value.issues.slice(0, 10).map(
                (
                  issue, // Limit to 10 for performance
                ) => (
                  <article
                    key={issue.id}
                    class="dark:hover:bg-stone-650 rounded-lg border border-stone-200 bg-white p-3 transition-shadow hover:bg-stone-50 hover:shadow-md sm:p-4 dark:border-stone-600 dark:bg-stone-700"
                    role="article"
                    aria-labelledby={`issue-title-${issue.id}`}
                  >
                    <div class="mb-2 flex flex-col items-start gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <h3
                        id={`issue-title-${issue.id}`}
                        class="text-base font-medium text-stone-900 sm:text-lg dark:text-stone-100"
                      >
                        <a
                          href={issue.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="rounded text-emerald-600 hover:text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white focus:outline-none dark:text-emerald-400 dark:hover:text-emerald-300 dark:focus:ring-offset-stone-700"
                        >
                          {issue.title}
                        </a>
                      </h3>
                      <span
                        class={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          issue.state === "open"
                            ? "border border-emerald-700 bg-emerald-900 text-emerald-200"
                            : "border border-stone-500 bg-stone-600 text-stone-300"
                        }`}
                        role="status"
                        aria-label={`Issue status: ${issue.state}`}
                      >
                        {issue.state}
                      </span>
                    </div>

                    <p class="mb-2 text-sm text-stone-600 sm:mb-3 dark:text-stone-400">
                      {issue.repository_full_name} #{issue.number}
                    </p>

                    {issue.labels.length > 0 && (
                      <div class="mb-2 flex flex-wrap gap-1 sm:mb-3">
                        {issue.labels.slice(0, 3).map(
                          (
                            label, // Limit labels for mobile
                          ) => (
                            <span
                              key={label}
                              class="inline-flex items-center rounded-full border border-stone-500 bg-stone-600 px-2 py-1 text-xs font-medium text-stone-200"
                              role="tag"
                              aria-label={`Label: ${label}`}
                            >
                              {label}
                            </span>
                          ),
                        )}
                        {issue.labels.length > 3 && (
                          <span
                            class="text-xs text-stone-400"
                            aria-label={`${issue.labels.length - 3} more labels`}
                          >
                            +{issue.labels.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div class="flex flex-col items-start gap-1 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between dark:text-stone-400">
                      <span>
                        Created{" "}
                        {new Date(issue.created_at).toLocaleDateString()}
                      </span>
                      {issue.repository_language && (
                        <span class="rounded border border-stone-500 bg-stone-600 px-2 py-1 text-xs font-medium text-stone-200">
                          {issue.repository_language}
                        </span>
                      )}
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
