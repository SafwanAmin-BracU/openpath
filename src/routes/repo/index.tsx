import { component$, useSignal } from "@builder.io/qwik";
import {
  Link,
  routeLoader$,
  useLocation,
  useNavigate,
} from "@builder.io/qwik-city";
import { Octokit } from "octokit";

const useUserRepos = routeLoader$(async ({ sharedMap, url }) => {
  const per_page = url.searchParams.get("per_page")
    ? parseInt(url.searchParams.get("per_page")!)
    : 5;
  const page = url.searchParams.get("page")
    ? parseInt(url.searchParams.get("page")!)
    : 1;

  const octokit: Octokit = sharedMap.get("octokit");
  if (!octokit) throw new Error("Octokit instance not found in sharedMap");

  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    page,
    per_page,
  });
  const temp = await octokit.graphql(
    `#graphql
    query {
      viewer {
        repositories(first: 10) {
          edges {
            node {
              id
              name
              description
              languages(first: 10) {
                nodes {
                  name
                  color
                  id
              }              
            }
          }
    
      }
    }
  }
  }`,
  );

  return data;
});

export default component$(() => {
  return (
    <>
      <UserRepos />
    </>
  );
});

const UserRepos = component$(() => {
  const loc = useLocation();
  const nav = useNavigate();
  const userRepos = useUserRepos();
  const currentPage = useSignal<number>(
    loc.url.searchParams.get("page")
      ? parseInt(loc.url.searchParams.get("page")!)
      : 1,
  );

  return (
    <div
      class="grid size-full gap-3"
      style={{
        gridTemplateColumns: "1fr",
        gridTemplateRows: "auto 1fr",
        gridTemplateAreas: `"header" "main"`,
      }}
    >
      <header class="flex justify-between gap-2">
        <div>
          <h1 class="text-2xl font-bold">Your Repositories</h1>
          <p class="text-sm text-gray-600">
            Here are the repositories you own on GitHub.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            onClick$={() =>
              nav(`/repo/?page=${currentPage.value - 1}`, {
                replaceState: true,
              })
            }
          >
            Prev
          </button>
          <span>{currentPage}</span>
          <button
            onClick$={() =>
              nav(`/repo/?page=${currentPage.value + 1}`, {
                replaceState: true,
              })
            }
          >
            Next
          </button>
        </div>
      </header>
      <ul
        class="grid size-full grid-cols-1 grid-rows-5 gap-2"
        style={{
          scrollSnapType: "y mandatory",
          overflowY: "scroll",
          gridArea: "main",
        }}
      >
        {userRepos.value.map((repo) => (
          <UserRepoCard repo={repo} key={repo.id} />
        ))}
      </ul>
    </div>
  );
});

const UserRepoCard = component$(
  ({ repo }: { repo: ReturnType<typeof useUserRepos>["value"][number] }) => {
    return (
      <div
        class="rounded-lg border p-4 shadow transition hover:bg-gray-100"
        style={{ scrollSnapAlign: "start" }}
      >
        <h3 class="text-lg font-semibold">{repo.name}</h3>
        <p class="text-sm text-gray-600">{repo.description}</p>
        <Link
          href={`/repo/${repo.full_name}`}
          class="text-blue-500 hover:underline"
        >
          View Repository
        </Link>
        <pre>
          <code class="text-xs text-gray-500">
            {JSON.stringify(repo.language, null, 2)}
          </code>
        </pre>
        <a href={repo.languages_url}>Languages</a>
      </div>
    );
  },
);
