import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { QwikAuth$ } from "@auth/qwik";
import GitHub from "@auth/qwik/providers/github";
import { db } from "~/server/db";

const { AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, AUTH_SECRET } = process.env;
if (!AUTH_GITHUB_ID || !AUTH_GITHUB_SECRET || !AUTH_SECRET) {
  throw new Error("Missing required environment variables for authentication");
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
    adapter: DrizzleAdapter(db),
    callbacks: {
      session({ session, user }) {
        session.user.id = user.id;
        return session;
      },
    },
  }),
);
