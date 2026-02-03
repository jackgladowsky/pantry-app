import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { mealName, pantryItems } = await request.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const pantryList = pantryItems?.map((item: any) => item.name).join(", ") || "None listed";

    const prompt = `Generate a complete recipe for "${mealName}".

The user has these ingredients on hand (use as many as possible):
${pantryList}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "name": "${mealName}",
  "servings": 2,
  "prepTime": 15,
  "cookTime": 20,
  "tags": ["tag1", "tag2"],
  "ingredients": [
    {"name": "ingredient", "quantity": "1 cup"},
    {"name": "ingredient2", "quantity": "2 tbsp"}
  ],
  "instructions": [
    "Step 1 instruction",
    "Step 2 instruction",
    "Step 3 instruction"
  ],
  "notes": "Optional tips or notes"
}

Rules:
- Use pantry items when possible, but add necessary ingredients that might not be listed
- Keep instructions clear and concise
- Be realistic with prep/cook times
- Add relevant tags (quick, healthy, comfort, etc.)`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://pantry.local",
        "X-Title": "Pantry App",
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5-8b",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter error:", error);
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "No recipe returned" }, { status: 500 });
    }

    // Parse the JSON response
    try {
      const recipe = JSON.parse(content);
      return NextResponse.json({ recipe });
    } catch (e) {
      // Try to extract JSON from the response if it has extra text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const recipe = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ recipe });
      }
      console.error("Failed to parse AI response:", content);
      return NextResponse.json({ error: "Failed to parse recipe" }, { status: 500 });
    }
  } catch (error) {
    console.error("Generate recipe error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
