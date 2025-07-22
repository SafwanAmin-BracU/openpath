import { component$ } from "@builder.io/qwik";
import { Link, routeLoader$, useNavigate } from "@builder.io/qwik-city";
import { Octokit } from "octokit";

const useUserRepos = routeLoader$(async ({ sharedMap, url }) => {
  const after = url.searchParams.get("after") || null;
  const before = url.searchParams.get("before") || null;

  const octokit: Octokit = sharedMap.get("octokit");
  if (!octokit) throw new Error("Octokit instance not found in sharedMap");

  // Determine pagination direction and build query accordingly
  const isBackward = before !== null;
  const variables: any = {};
  let query: string;

  if (isBackward) {
    // Going backward - use 'last' and 'before'
    query = `
      query ($before: String!) {
        viewer {
          repositories(last: 5, before: $before) {
            totalCount
            pageInfo {
              hasNextPage
              endCursor
              hasPreviousPage
              startCursor
            }
            nodes {
              name
              owner {
                login
              }
            }
          }
        }
      }`;
    variables.before = before;
  } else {
    // Going forward - use 'first' and 'after'
    query = `
      query ($after: String) {
        viewer {
          repositories(first: 5, after: $after) {
            totalCount
            pageInfo {
              hasNextPage
              endCursor
              hasPreviousPage
              startCursor
            }
            nodes {
              name
              owner {
                login
              }
            }
          }
        }
      }`;
    if (after) {
      variables.after = after;
    }
  }

  const data = await octokit.graphql<{
    viewer: {
      repositories: {
        totalCount: number;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string;
          hasPreviousPage: boolean;
          startCursor: string;
        };
        nodes: Array<{ name: string; owner: { login: string } }>;
      };
    };
  }>(query, variables);

  return { data };
});

export default component$(() => {
  return (
    <>
      <UserRepos />
    </>
  );
});

const UserRepos = component$(() => {
  const nav = useNavigate();
  const userRepos = useUserRepos();

  return (
    <div
      class="grid size-full gap-3"
      style={{
        gridTemplateColumns: "1fr",
        gridTemplateRows: "auto 1fr",
        gridTemplateAreas: `"header" "main"`,
      }}
    >
      <Header pageInfo={userRepos.value.data.viewer.repositories.pageInfo} />
      <ul class="flex flex-col gap-2">
        {userRepos.value.data.viewer.repositories.nodes.map((repo) => (
          <li
            key={repo.name}
            class="cursor-pointer rounded-md bg-gray-100 p-3 hover:bg-gray-200"
            onClick$={() => {
              nav(`/repo/${repo.owner.login}/${repo.name}`, {
                replaceState: true,
              });
            }}
          >
            <h2 class="text-lg font-semibold">{repo.name}</h2>
            <p class="text-sm text-gray-600">Owned by {repo.owner.login}</p>
          </li>
        ))}
      </ul>
    </div>
  );
});

const Header = component$(
  ({
    pageInfo,
  }: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
      hasPreviousPage: boolean;
      startCursor: string;
    };
  }) => {
    const nav = useNavigate();

    return (
      <header class="flex gap-2">
        <div class="flex items-center gap-2">
          <Link
            class="h-full rounded-md bg-gray-200 p-3 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            href={"/repo?before=" + pageInfo.startCursor}
            prefetch="js"
          >
            {"<"}
          </Link>
          <Link
            class="h-full rounded-md bg-gray-200 p-3 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            href={"/repo?after=" + pageInfo.endCursor}
            prefetch="js"
          >
            {">"}
          </Link>
        </div>
        <div class="flex size-full flex-col gap-1">
          <h1 class="text-2xl font-bold">Your Repositories</h1>
          <p class="text-sm text-gray-600">
            Here are the repositories you own on GitHub.
          </p>
        </div>
      </header>
    );
  },
);
