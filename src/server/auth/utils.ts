import { RequestEvent } from "@builder.io/qwik-city";

const isOutdated = (expires: string) => new Date(expires) < new Date(Date.now());

export const verifySessionMiddleware = (event: RequestEvent) => {
    const session = event.sharedMap.get("session");
    if (!session || isOutdated(session.expires) || !session.user) {
        throw event.redirect(302, `/auth/signin?callbackUrl=${event.url.pathname}`);
    }
}
