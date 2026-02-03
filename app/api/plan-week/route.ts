import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { pantryItems, recipes, preferences, startDate } = await request.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const recipeList = recipes?.map((r: any) => ({
      id: r._id,
      name: r.name,
      tags: r.tags,
      time: (r.prepTime || 0) + (r.cookTime || 0),
    })) || [];

    const prompt = `You are a meal planning assistant. Create a week of dinner suggestions starting from ${startDate}.

## User's Saved Recipes:
${recipeList.map((r: any) => `- "${r.name}" (ID: ${r.id}) [${r.tags?.join(", ") || "no tags"}] - ${r.time}min`).join("\n") || "No saved recipes yet"}

## Current Pantry:
${pantryItems?.map((item: any) => `- ${item.name}`).join("\n") || "Empty pantry"}

## Preferences:
${preferences || "None specified"}

Create a 7-day dinner plan. For each day, suggest ONE dinner. Try to:
1. Use their saved recipes when possible (reference by exact name)
2. Vary the meals (don't repeat within the week)
3. Consider prep time (quick meals on weeknights)
4. Use ingredients from their pantry

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "plan": [
    {"day": "Monday", "date": "YYYY-MM-DD", "meal": "Recipe Name or Custom Meal", "recipeId": "id-if-using-saved-recipe-or-null", "notes": "optional quick note"},
    {"day": "Tuesday", "date": "YYYY-MM-DD", "meal": "...", "recipeId": null, "notes": "..."},
    ...
  ]
}

Use the recipe IDs exactly as provided. If suggesting a custom meal not in their recipes, set recipeId to null.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://pantry.local",
        "X-Title": "Pantry App",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter error:", error);
      return NextResponse.json({ error: "AI planning failed" }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "No plan returned" }, { status: 500 });
    }

    // Parse the JSON response
    try {
      const plan = JSON.parse(content);
      return NextResponse.json(plan);
    } catch (e) {
      // Try to extract JSON from the response if it has extra text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const plan = JSON.parse(jsonMatch[0]);
        return NextResponse.json(plan);
      }
      console.error("Failed to parse AI response:", content);
      return NextResponse.json({ error: "Failed to parse meal plan" }, { status: 500 });
    }
  } catch (error) {
    console.error("Planning error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
