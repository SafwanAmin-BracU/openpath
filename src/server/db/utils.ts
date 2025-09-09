import { db } from "."

export const getUserById = async (id: string) => {
    return db.query.users.findFirst({
        where(fields, operators) {
            return operators.eq(fields.id, id);
        },
    })
}

export const getAccessTokenByUserId = async (userId: string) => {
    const account = await db.query.accounts.findFirst({
        where(fields, operators) {
            return operators.eq(fields.userId, userId);
        },
    });
    return account?.access_token || null;
}