import { component$ } from "@builder.io/qwik";
import { Link, routeLoader$ } from "@builder.io/qwik-city";
import { Octokit } from "octokit";

export const useDataLoader = routeLoader$(async ({ sharedMap }) => {
  const octokit: Octokit = sharedMap.get("octokit");
  // if (!octokit) throw new Error("Octokit instance not found in sharedMap");

  // Example query to fetch user language skills
  const recommendedRepos = await octokit.graphql<{
    search: {
      repositoryCount: number;
      pageInfo: {
        endCursor: string;
        startCursor: string;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
      nodes: Array<{
        name: string;
        nameWithOwner: string;
        description: string;
        stargazerCount: number;
        forkCount: number;
        pushedAt: string;
        url: string;
        primaryLanguage: {
          name: string;
        };
        issues: {
          totalCount: number;
        };
      }>;
    };
  }>(
    `#graphql
    query ($queryStr: String!, $first: Int!) {
  search(query: $queryStr, type: REPOSITORY, first: $first) {
    repositoryCount
    pageInfo {
      endCursor
      hasNextPage
      startCursor
      hasPreviousPage
    }
    nodes {
      ... on Repository {
        name
        nameWithOwner
        description
        stargazerCount
        forkCount
        pushedAt
        url
        primaryLanguage {
          name
        }
        issues(
          labels: ["good first issue"]
          states: OPEN
          first: 5
          orderBy: {field: CREATED_AT, direction: DESC}
        ) {
          totalCount
        }
      }
    }
  }
}
`,
    {
      queryStr:
        "stars:>50 pushed:>2025-01-01 sort:updated-desc good-first-issue",
      first: 5,
      after: "",
      before: "",
    },
  );

  const userLanguageSkills = await octokit.graphql<{
    viewer: {
      repositories: {
        totalCount: number;
        nodes: Array<{
          name: string;
          languages: {
            totalCount: number;
            edges: Array<{
              size: number;
              node: {
                name: string;
                color: string;
                id: string;
              };
            }>;
          };
        }>;
      };
    };
  }>(`#graphql
    query ViewerLanguages {
  viewer {
    repositories(first: 100) {
      totalCount
      nodes {
        name
        languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
          totalCount
          edges {
            size
            node {
              name
              color
              id
            }
          }
        }
      }
    }
  }
}
`);

  const languageSkills = userLanguageSkills.viewer.repositories.nodes.reduce(
    (acc, repo) => {
      repo.languages.edges.forEach((edge) => {
        if (!acc[edge.node.name]) {
          acc[edge.node.name] = { size: 0, color: edge.node.color };
        }
        acc[edge.node.name].size += edge.size;
      });
      return acc;
    },
    {} as Record<string, { size: number; color: string }>,
  );

  return { recommendedRepos, languageSkills };
});

export default component$(() => {
  const { recommendedRepos, languageSkills } = useDataLoader().value;
  return (
    <>
      <div class="grid grid-cols-3 gap-3">
        {/* Recommended Repositories */}
        <div class="col-span-2 flex flex-col gap-3">
          {recommendedRepos.search.nodes.map((repo) => (
            <div
              key={repo.name}
              class="flex size-full flex-col rounded-lg bg-stone-200 p-4"
            >
              <h3 class="text-lg font-semibold">{repo.name}</h3>
              <p class="mb-auto truncate text-sm">{repo.description}</p>
              <div class="my-2 flex items-center gap-4 text-sm text-gray-600">
                <span class="flex items-center gap-1">
                  ⭐ {repo.stargazerCount}
                </span>
                <span class="flex items-center gap-1">🍴 {repo.forkCount}</span>
              </div>
              <Link
                href={"/repo/" + repo.nameWithOwner}
                class="text-blue-500 hover:underline"
              >
                View Repository
              </Link>
            </div>
          ))}
        </div>
        {/* Language Skills */}
        <div class="flex flex-col gap-3 overflow-clip">
          {Object.entries(languageSkills).map(([lang, { size, color }]) => (
            <div
              key={lang}
              class={
                "flex items-center justify-between rounded-md p-2" +
                ` bg-[${color}]`
              }
            >
              <span class="font-semibold">{lang}</span>
              <span class="text-sm text-gray-600">{size} lines</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
});
