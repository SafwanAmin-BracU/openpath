import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { getOctokit } from "~/server/app/octokit";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  private: boolean;
  archived: boolean;
  topics: string[];
}

// Loader to fetch user repositories
export const useUserRepositories = routeLoader$<Repository[]>(
  async (requestEvent) => {
    try {
      const session = requestEvent.sharedMap.get("session");
      if (!session?.user?.id) {
        throw new Error("Authentication required");
      }

      const octokit = await getOctokit(session);

      // Fetch user repositories using REST API
      const response = await octokit.request("GET /user/repos", {
        sort: "updated",
        per_page: 50,
        type: "owner", // Only show repositories owned by the user
      });

      return response.data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        updated_at: repo.updated_at,
        private: repo.private,
        archived: repo.archived,
        topics: repo.topics || [],
      }));
    } catch (error) {
      console.error("Error fetching user repositories:", error);
      return [];
    }
  },
);

// Page component
export default component$(() => {
  const repositories = useUserRepositories();

  return (
    <div class="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-100">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="mb-4 text-3xl font-bold text-stone-900 dark:text-stone-100">
            My Repositories
          </h1>
          <p class="text-stone-600 dark:text-stone-400">
            View and manage your GitHub repositories. These are the repositories
            you own and have access to.
          </p>
        </div>

        {repositories.value.length === 0 ? (
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
            <h3 class="mb-2 text-lg font-medium text-stone-900 dark:text-stone-100">
              No repositories found
            </h3>
            <p class="text-stone-600 dark:text-stone-400">
              You don't have any repositories yet, or we couldn't load them.
            </p>
          </div>
        ) : (
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {repositories.value.map((repo) => (
              <RepositoryCard key={repo.id} repository={repo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// Repository Card Component
const RepositoryCard = component$<{ repository: Repository }>(
  ({ repository }) => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    return (
      <div class="group relative rounded-lg border border-stone-200 bg-white p-6 shadow-md transition-all hover:shadow-lg dark:border-stone-700 dark:bg-stone-800">
        {/* Repository Status Badges */}
        <div class="mb-3 flex items-center gap-2">
          {repository.private && (
            <span class="inline-flex items-center rounded-full border border-stone-500 bg-stone-600 px-2 py-1 text-xs font-medium text-stone-200">
              Private
            </span>
          )}
          {repository.archived && (
            <span class="inline-flex items-center rounded-full border border-amber-500 bg-amber-600 px-2 py-1 text-xs font-medium text-amber-200">
              Archived
            </span>
          )}
        </div>

        {/* Repository Name and Link */}
        <div class="mb-3">
          <h3 class="truncate text-lg font-semibold text-stone-900 dark:text-stone-100">
            <a
              href={`/user/repos/${repository.full_name}`}
              class="group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
              title={repository.name}
            >
              {repository.name}
            </a>
          </h3>
          {repository.full_name !== repository.name && (
            <p
              class="truncate text-sm text-stone-500 dark:text-stone-400"
              title={repository.full_name}
            >
              {repository.full_name}
            </p>
          )}
        </div>

        {/* Description */}
        {repository.description && (
          <p class="mb-4 line-clamp-3 text-sm text-stone-600 dark:text-stone-400">
            {repository.description}
          </p>
        )}

        {/* Topics */}
        {repository.topics.length > 0 && (
          <div class="mb-4 flex flex-wrap gap-1">
            {repository.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                class="inline-flex items-center rounded-full border border-stone-300 bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-300"
              >
                {topic}
              </span>
            ))}
            {repository.topics.length > 3 && (
              <span class="text-xs text-stone-400 dark:text-stone-500">
                +{repository.topics.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Repository Stats */}
        <div class="mb-4 flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400">
          {repository.language && (
            <div class="flex items-center gap-1">
              <div class="h-3 w-3 rounded-full bg-emerald-500"></div>
              <span>{repository.language}</span>
            </div>
          )}
          <div class="flex items-center gap-1">
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{repository.stargazers_count}</span>
          </div>
          <div class="flex items-center gap-1">
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 010 14h1a1 1 0 102 0V7.414l-2.293 2.293a1 1 0 11-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-2.293 2.293V17a1 1 0 102 0V7H5.414l2.293-2.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{repository.forks_count}</span>
          </div>
        </div>

        {/* Last Updated */}
        <div class="flex items-center justify-between">
          <div class="text-xs text-stone-400 dark:text-stone-500">
            Updated {formatDate(repository.updated_at)}
          </div>
          <a
            href={`/user/repos/${repository.name}`}
            class="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            View Details →
          </a>
        </div>

        {/* Hover overlay for internal navigation */}
        <a
          href={`/user/repos/${repository.name}`}
          class="absolute inset-0 rounded-lg border-2 border-transparent transition-colors hover:border-emerald-500"
          aria-label={`View details for ${repository.name}`}
        ></a>
      </div>
    );
  },
);
