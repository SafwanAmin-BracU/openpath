import { db } from "~/db";
import { Octokit } from "octokit";

export class OctokitFactory {
  static async createOctokitInstance(userId: string) {
    const authUser = await db.query.accounts.findFirst({
      where: (account, { eq }) => eq(account.userId, userId),
    });

    if (!authUser || !authUser.access_token)
      throw new Error(`No access token found for user ID: ${userId}`);

    return new Octokit({ auth: authUser.access_token });
  }
}
