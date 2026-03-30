import { NextRequest, NextResponse } from "next/server";
import { groq, GROQ_MODEL } from "@/lib/groq";
import { buildTripPrompt } from "@/lib/trip-prompt";
import type { TripFormData } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const form: TripFormData = await req.json();

    if (!form.destination?.trim()) {
      return NextResponse.json({ error: "יעד נדרש" }, { status: 400 });
    }

    const prompt = buildTripPrompt(form);

    const stream = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
      stream: true,
    });

    // Stream response back to client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("Groq error:", err);
    return NextResponse.json({ error: "שגיאה בייצור המסלול" }, { status: 500 });
  }
}
