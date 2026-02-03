import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { pantryItems, recipes, expiringSoon } = await request.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const prompt = `You are a helpful kitchen assistant. Based on the user's pantry and recipes, suggest what they should cook.

## Current Pantry Items:
${pantryItems.map((item: any) => `- ${item.name}${item.quantity ? ` (${item.quantity})` : ""}`).join("\n")}

## Items Expiring Soon (use these first!):
${expiringSoon.length > 0 ? expiringSoon.map((item: any) => `- ${item.name} (expires soon!)`).join("\n") : "None"}

## Their Saved Recipes:
${recipes.map((r: any) => `- ${r.name}: needs ${r.ingredients.map((i: any) => i.name).join(", ")}`).join("\n")}

Based on this, give me:
1. **Top Pick**: The best thing to cook tonight (prioritize using expiring items)
2. **Quick Option**: Something fast (<20 min)
3. **Use It Up**: A suggestion to use items that are expiring

Keep responses concise and friendly. If they can make one of their saved recipes, mention that! If not, suggest something simple with what they have.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://pantry.local",
        "X-Title": "Pantry App",
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter error:", error);
      return NextResponse.json({ error: "AI suggestion failed" }, { status: 500 });
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content;

    if (!suggestion) {
      return NextResponse.json({ error: "No suggestion returned" }, { status: 500 });
    }

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("Suggestion error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
