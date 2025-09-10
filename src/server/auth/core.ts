import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { QwikAuth$ } from "@auth/qwik";
import GitHub from "@auth/qwik/providers/github";
import { db } from "../db";

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
    () => {
        const { AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, AUTH_SECRET } = process.env;
        if (!AUTH_GITHUB_ID || !AUTH_GITHUB_SECRET || !AUTH_SECRET) {
            throw new Error("Missing required environment variables for authentication");
        }

        return {
            providers: [
                GitHub({
                    clientId: AUTH_GITHUB_ID,
                    clientSecret: AUTH_GITHUB_SECRET,
                    authorization: {
                        params: {
                            scope: "repo user",
                        },
                    },
                })
            ],

            secret: AUTH_SECRET,
            adapter: DrizzleAdapter(db),

            callbacks: {
                async session({ session, user }) {
                    return { ...session, user };
                }

            }
        };
    }
);
