import { Session } from "@auth/qwik";
import { Octokit } from "octokit";
import { getAccessTokenByUserId } from "../db";


export const getOctokit = async (session: Session) => {
    const userId = session?.user?.id;
    if (!userId) {
        throw new Error("No user ID found in session");
    }
    const accessToken = await getAccessTokenByUserId(userId);
    if (!accessToken) {
        throw new Error("No access token found for user");
    }
    return new Octokit({auth: accessToken});
};

export const getViewerData = async (octokit: Octokit) => {
    const data = await octokit.graphql<{
        viewer: {
          login: string;
          name: string;
          avatarUrl: string;
          url: string;
          email: string;
        };
      }>(
        `#graphql
        query {
          viewer {
            login
            name
            avatarUrl
            url
            email
          }
        }
        `,
      );
    return data.viewer;
}