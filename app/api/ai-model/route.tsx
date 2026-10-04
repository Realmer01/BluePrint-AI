import { db } from "@/configs/db";
import { usersTable, WireframeToCodeTable } from "@/configs/schema";
import Constants from "@/data/Constants";
import { extractCode } from "@/lib/extractCode";
import { getAuthUser, serverError, unauthorized } from "@/lib/firebaseAdmin";
import { and, eq, gt, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import OpenAI from "openai"
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_AI_API_KEY,

})
export const maxDuration = 300;

const MAX_CHANGES_LENGTH = 1000;

// Generate code for one of the signed-in user's designs, or with "changes", edit its saved code.
// The prompt is built here from the saved design, so this endpoint can't be used for arbitrary prompts.
export async function POST(req: Request) {
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    let record;
    let changes = '';
    try {
        const body = await req.json();
        changes = typeof body.changes === 'string' ? body.changes.trim() : '';
        if (changes.length > MAX_CHANGES_LENGTH) {
            return NextResponse.json({ error: `Please keep your changes under ${MAX_CHANGES_LENGTH} characters.` }, { status: 400 });
        }
        const result = await db.select().from(WireframeToCodeTable)
            .where(and(eq(WireframeToCodeTable.uid, String(body.uid)), eq(WireframeToCodeTable.createdBy, user.email)));
        record = result[0];
        if (!record) return NextResponse.json({ error: 'Design not found.' }, { status: 404 });
    } catch (e) {
        return serverError(e);
    }

    const savedCode = (record.code as { resp?: string } | null)?.resp;
    const isFirstGeneration = !savedCode;
    if (changes && isFirstGeneration) {
        return NextResponse.json({ error: 'Generate the code first, then request changes.' }, { status: 400 });
    }

    // The first generation and every requested change cost a credit; plain regenerating is free
    const chargesCredit = isFirstGeneration || !!changes;
    if (chargesCredit) {
        try {
            const userResult = await db.select().from(usersTable).where(eq(usersTable.email, user.email));
            if (!userResult[0]?.credits || userResult[0].credits <= 0) {
                return NextResponse.json({ error: 'Not enough credits!' }, { status: 402 });
            }
        } catch (e) {
            return serverError(e);
        }
    }

    // Selected model first, then the others as fallbacks (free models are often rate-limited)
    const allModels = Constants.AiModelList.map(item => item.modelName);
    const primaryModel = Constants.AiModelList.find(item => item.name == record.model)?.modelName ?? allModels[0];
    const models = [primaryModel, ...allModels.filter(m => m != primaryModel)];

    let response: AsyncIterable<OpenAI.Chat.ChatCompletionChunk>;
    try {
        response = await openai.chat.completions.create({
            model: primaryModel,
            models: models, // OpenRouter-specific: fallback models
            stream: true,
            messages: [
                {
                    "role": "user",
                    // Changes only need the current code; it already reflects the wireframe
                    "content": changes ? [
                        {
                            "type": "text",
                            "text": `${Constants.CHANGES_PROMPT}\nCurrent code:\n\`\`\`jsx\n${savedCode}\n\`\`\`\n\nChanges requested by the user:\n${changes}`
                        }
                    ] : [
                        {
                            "type": "text",
                            "text": `${Constants.PROMPT}\nDescription of the page:\n${record.description}`
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": record.imageUrl ?? ''
                            }
                        }
                    ]
                }
            ]
        } as OpenAI.Chat.ChatCompletionCreateParamsStreaming);
    } catch (e) {
        console.error('AI request failed:', e instanceof Error ? e.message : e);
        const busy = e instanceof OpenAI.APIError && e.status == 429;
        return NextResponse.json({
            error: busy
                ? 'All AI models are busy right now. Please try again in a minute.'
                : 'The AI model failed to respond. Please try again.'
        }, { status: 503 });
    }

    const userEmail = user.email;
    const uid = record.uid!;
    // Stream the code to the browser, then save it and charge the credit once it completes
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            let fullText = '';
            let answeredBy = '';
            try {
                for await (const chunk of response) {
                    answeredBy = chunk.model || answeredBy;
                    const text = chunk.choices?.[0]?.delta?.content || "";
                    if (!text) continue;
                    fullText += text;
                    controller.enqueue(encoder.encode(text));
                }

                const code = extractCode(fullText).trim();
                if (!code) throw new Error('Model returned an empty response');

                await db.update(WireframeToCodeTable)
                    .set({ code: { resp: code } })
                    .where(eq(WireframeToCodeTable.uid, uid));
                if (chargesCredit) {
                    await db.update(usersTable)
                        .set({ credits: sql`${usersTable.credits} - 1` })
                        .where(and(eq(usersTable.email, userEmail), gt(usersTable.credits, 0)));
                }
                console.log(`Generated code for ${uid} with ${answeredBy}`);
                controller.close();
            } catch (e) {
                console.error('AI stream failed:', e instanceof Error ? e.message : e);
                controller.error(e);
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });

}
