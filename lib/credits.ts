import { db } from "@/configs/db";
import { usersTable } from "@/configs/schema";
import { and, eq, isNull, lt, or, sql } from "drizzle-orm";

export const DAILY_FREE_CREDITS = 3;

// Once per day (UTC), top the user's credits back up to DAILY_FREE_CREDITS. It never takes credits
// away, and the date check sits in the WHERE clause so parallel requests can't refill twice.
export async function refillDailyCredits(email: string) {
    await db.update(usersTable)
        .set({
            credits: sql`GREATEST(COALESCE(${usersTable.credits}, 0), ${DAILY_FREE_CREDITS})`,
            creditsRefilledAt: sql`now()`,
        })
        .where(and(
            eq(usersTable.email, email),
            or(isNull(usersTable.creditsRefilledAt), lt(usersTable.creditsRefilledAt, sql`date_trunc('day', now())`))
        ));
}
