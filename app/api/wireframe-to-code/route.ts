import { db } from "@/configs/db";
import { usersTable, WireframeToCodeTable } from "@/configs/schema";
import Constants from "@/data/Constants";
import { getAuthUser, serverError, unauthorized } from "@/lib/firebaseAdmin";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const MAX_IMAGE_LENGTH = 3_000_000; // ~2 MB image as a data URL; compressed wireframes are far smaller

// Save a new design. The credit is only charged once its first generation succeeds (see /api/ai-model)
export async function POST(req: Request) {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    try {
        const { description, imageUrl, model, uid } = await req.json();

        if (typeof uid !== 'string' || !uid ||
            typeof description !== 'string' || !description.trim() ||
            !Constants.AiModelList.some(item => item.name == model) ||
            typeof imageUrl !== 'string' || !imageUrl.startsWith('data:image/') || imageUrl.length > MAX_IMAGE_LENGTH) {
            return NextResponse.json({ error: 'Please add a wireframe image, pick a model and write a description.' }, { status: 400 });
        }

        const creditResult = await db.select().from(usersTable)
            .where(eq(usersTable.email, user.email));
        if (!creditResult[0]?.credits || creditResult[0].credits <= 0) {
            return NextResponse.json({ error: 'Not enough credits!' }, { status: 402 });
        }

        const result = await db.insert(WireframeToCodeTable).values({
            uid: uid,
            description: description,
            imageUrl: imageUrl,
            model: model,
            createdBy: user.email
        }).returning({ uid: WireframeToCodeTable.uid });

        return NextResponse.json(result[0]);
    } catch (e) {
        return serverError(e);
    }
}

// ?uid=... returns one of the user's designs; without it, all of the user's designs
export async function GET(req: Request) {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    try {
        const uid = new URL(req.url).searchParams.get('uid');
        if (uid) {
            const result = await db.select()
                .from(WireframeToCodeTable)
                .where(and(eq(WireframeToCodeTable.uid, uid), eq(WireframeToCodeTable.createdBy, user.email)));
            if (result.length == 0) {
                return NextResponse.json({ error: 'Design not found.' }, { status: 404 });
            }
            return NextResponse.json(result[0]);
        }

        const result = await db.select()
            .from(WireframeToCodeTable)
            .where(eq(WireframeToCodeTable.createdBy, user.email))
            .orderBy(desc(WireframeToCodeTable.id));
        return NextResponse.json(result);
    } catch (e) {
        return serverError(e);
    }
}
