import { component$ } from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import { Octokit } from "octokit";

const useRepoDetails = routeLoader$(async ({ sharedMap, params }) => {
  type RepoDetails = {
    repository: {
      owner: {
        avatarUrl: string;
        login: string;
      };
      createdAt: string;
      isFork: boolean;
      descriptionHTML: string;
      stargazerCount: number;
      forkCount: number;
      forkingAllowed: boolean;
      issues: {
        totalCount: number;
        nodes: Array<{
          author: {
            login: string;
            avatarUrl: string;
          };
          title: string;
          state: string;
        }>;
      };
    };
  };
  const octokit: Octokit = sharedMap.get("octokit");
  const { owner, name } = params;
  const repoDetails = await octokit.graphql<RepoDetails>(`#graphql
  query ViewerLanguages {
  repository (name:"${name}", owner:"${owner}") {
    owner {
      avatarUrl
      login
    }
    createdAt
    isFork
    descriptionHTML
    stargazerCount
    forkCount
    forkingAllowed
    issues (first: 10) {
      totalCount
      nodes {
        author {
          login
          avatarUrl
        }
        title
        state
      }
    }
    
  }
}

    `);

  return { repoDetails };
});

export default component$(() => {
  const { repoDetails } = useRepoDetails().value;
  const loc = useLocation();
  const repo = repoDetails.repository;

  return (
    <div class="flex flex-col gap-6 p-6">
      {/* Repository Header */}
      <header class="flex items-start gap-4 rounded-lg border bg-white p-6 shadow-sm">
        <img
          src={repo.owner.avatarUrl || "/default-avatar.png"}
          alt={`${repo.owner.login} avatar`}
          class="size-16 rounded-full"
        />
        <div class="flex-1">
          <div class="mb-2 flex items-center gap-2">
            <h1 class="text-2xl font-bold text-gray-900">
              {repo.owner.login}/{loc.params.name}
            </h1>
            {repo.isFork && (
              <span class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                🍴 Forked
              </span>
            )}
          </div>

          {repo.descriptionHTML && (
            <div
              class="mb-4 text-gray-600"
              dangerouslySetInnerHTML={repo.descriptionHTML}
            />
          )}

          <div class="flex items-center gap-6 text-sm text-gray-600">
            <span class="flex items-center gap-1">
              ⭐ {repo.stargazerCount} stars
            </span>
            <span class="flex items-center gap-1">
              🍴 {repo.forkCount} forks
            </span>
            <span class="flex items-center gap-1">
              📅 Created {new Date(repo.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </header>

      {/* Repository Actions */}
      <div class="flex gap-3">
        <button class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          ⭐ Star
        </button>
        {repo.forkingAllowed && (
          <button class="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
            🍴 Fork
          </button>
        )}
        <button class="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
          👁️ Watch
        </button>
      </div>

      {/* Issues Section */}
      <section class="rounded-lg border bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">
            Issues ({repo.issues.totalCount})
          </h2>
          <button class="rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700">
            New Issue
          </button>
        </div>

        {repo.issues.nodes.length > 0 ? (
          <div class="space-y-3">
            {repo.issues.nodes
              .filter((issue) => issue && issue.title && issue.author)
              .map((issue, index) => (
                <div
                  key={`${issue.title}-${index}`}
                  class="flex items-start gap-3 rounded-md border p-4 hover:bg-gray-50"
                >
                  <div
                    class={`mt-2 size-2 flex-shrink-0 rounded-full ${
                      issue.state === "OPEN" ? "bg-green-500" : "bg-purple-500"
                    }`}
                  />

                  <div class="min-w-0 flex-1">
                    <h3 class="truncate font-medium text-gray-900">
                      {issue.title || "Untitled Issue"}
                    </h3>
                    <div class="mt-1 flex items-center gap-2 text-sm text-gray-600">
                      <img
                        src={issue.author?.avatarUrl || "/default-avatar.png"}
                        alt={`${issue.author?.login || "Unknown"} avatar`}
                        class="size-4 rounded-full"
                      />
                      <span>by {issue.author?.login || "Unknown"}</span>
                      <span
                        class={`rounded-full px-2 py-0.5 text-xs ${
                          issue.state === "OPEN"
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {issue.state?.toLowerCase() || "unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div class="py-8 text-center text-gray-500">
            <p>No issues found for this repository.</p>
          </div>
        )}
      </section>
    </div>
  );
});
