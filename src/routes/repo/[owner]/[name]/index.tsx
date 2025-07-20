import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { Octokit } from "octokit";

const useRepoDetails = routeLoader$(async ({ sharedMap, params }) => {
  const octokit: Octokit = sharedMap.get("octokit");
  const repo = await octokit.rest.repos.get({
    owner: params.owner,
    repo: params.repo,
  });

  return { data: repo.data };
});

export default component$(() => {
  const repoDetails = useRepoDetails();
  return (
    <div class="m-4 size-full">
      <h1 class="text-2xl font-bold">{repoDetails.value.data.name}</h1>
      <h2 class="text-xl font-semibold text-gray-700">
        @{repoDetails.value.data.owner.login}
      </h2>
      <p class="text-sm text-gray-500">{repoDetails.value.data.description}</p>
      <p class="text-sm text-gray-500">
        Created at:{" "}
        {new Date(repoDetails.value.data.created_at).toLocaleDateString()}
      </p>
      <p class="text-sm text-gray-500">
        Updated at:{" "}
        {new Date(repoDetails.value.data.updated_at).toLocaleDateString()}
      </p>
    </div>
  );
});
