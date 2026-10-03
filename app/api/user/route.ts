import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/configs/db";
import { usersTable } from "@/configs/schema";
import { getAuthUser, serverError, unauthorized } from "@/lib/firebaseAdmin";

// Create the signed-in user on first login (3 free credits), or return the existing one
export async function POST(req: Request) {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    try {
        const existing = await db.select().from(usersTable)
            .where(eq(usersTable.email, user.email));
        if (existing.length > 0) return NextResponse.json(existing[0]);

        // onConflictDoNothing: the dashboard can call this twice at once on first login
        const created = await db.insert(usersTable).values({
            name: user.name,
            email: user.email,
            credits: 3,
        }).onConflictDoNothing().returning();
        if (created.length > 0) return NextResponse.json(created[0]);

        const result = await db.select().from(usersTable)
            .where(eq(usersTable.email, user.email));
        return NextResponse.json(result[0]);
    } catch (e) {
        return serverError(e);
    }
}

// The signed-in user's own record (credits etc.)
export async function GET(req: Request) {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    try {
        const result = await db.select().from(usersTable)
            .where(eq(usersTable.email, user.email));
        return NextResponse.json(result[0] ?? null);
    } catch (e) {
        return serverError(e);
    }
}
