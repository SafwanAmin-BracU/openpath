import { QwikAuth$, Session } from "@auth/qwik";
import GitHub from "@auth/qwik/providers/github";

const { AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, AUTH_SECRET } = process.env;
if (!AUTH_GITHUB_ID || !AUTH_GITHUB_SECRET || !AUTH_SECRET) {
  throw new Error("Missing required environment variables for authentication");
}

export interface SessionWithAccessToken extends Session {
  accessToken?: string;
}

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
  () => ({
    providers: [
      GitHub({
        clientId: AUTH_GITHUB_ID,
        clientSecret: AUTH_GITHUB_SECRET,
        authorization: {
          params: {
            scope: "repo user",
          },
        },
      }),
    ],
    secret: AUTH_SECRET,
    callbacks: {
      async session({ session, token }) {
        return { ...session, accessToken: token.accessToken };
      },
      async jwt({ token, user, account }) {
        if (user) {
          token.id = user.id;
        }
        if (account) {
          token.accessToken = account.access_token;
        }
        return token;
      },
    },
  }),
);
