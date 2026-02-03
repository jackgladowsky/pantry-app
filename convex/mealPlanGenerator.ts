import { action, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Internal query to get all data needed for meal planning
export const getPlanningContext = internalQuery({
  args: {},
  handler: async (ctx) => {
    const recipes = await ctx.db.query("recipes").collect();
    const pantryItems = await ctx.db.query("pantryItems").collect();
    
    // Get items expiring within 7 days
    const now = Date.now();
    const weekFromNow = now + 7 * 24 * 60 * 60 * 1000;
    const expiringSoon = pantryItems.filter(
      (item) => item.expiresAt && item.expiresAt <= weekFromNow
    );
    
    return { recipes, pantryItems, expiringSoon };
  },
});

// Generate a meal plan using AI
export const generate = action({
  args: {
    // Preferences
    daysToEatOut: v.number(), // How many days eating out/takeout
    eatingOutDays: v.optional(v.array(v.string())), // Specific days like ["friday", "saturday"]
    householdSize: v.number(), // Number of people eating
    mealsPerDay: v.array(v.string()), // Which meals to plan: ["dinner"] or ["lunch", "dinner"]
    preferQuickMeals: v.optional(v.boolean()), // Prefer quick recipes on weekdays
    useExpiring: v.optional(v.boolean()), // Prioritize expiring ingredients
    startDate: v.string(), // YYYY-MM-DD
    numDays: v.number(), // Usually 7 for a week
  },
  handler: async (ctx, args) => {
    // Get context data
    const { recipes, pantryItems, expiringSoon } = await ctx.runQuery(
      internal.mealPlanGenerator.getPlanningContext
    );
    
    if (recipes.length === 0) {
      throw new Error("No recipes found. Add some recipes first!");
    }
    
    // Build the prompt
    const prompt = buildMealPlanPrompt({
      recipes,
      pantryItems,
      expiringSoon,
      ...args,
    });
    
    // Call AI (using OpenRouter or similar)
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "system",
            content: `You are a meal planning assistant. Generate a practical meal plan based on the user's preferences and available recipes. 
            
Output ONLY valid JSON in this exact format:
{
  "plan": [
    {
      "date": "YYYY-MM-DD",
      "meals": [
        {
          "type": "dinner",
          "recipeId": "recipe_id_here or null",
          "customMeal": "Takeout - Pizza" or "Leftovers from Monday" or null,
          "isLeftover": true/false
        }
      ]
    }
  ],
  "shoppingNeeded": ["ingredient1", "ingredient2"],
  "notes": "Brief explanation of the plan"
}

Rules:
- If a recipe makes more servings than needed, schedule leftovers for the next meal instead of cooking again
- Don't repeat the same recipe within 3 days unless it's leftovers
- Respect eating out preferences
- Consider prep/cook time for weekday vs weekend meals
- Prioritize using expiring ingredients`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`AI request failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }
    
    // Parse the JSON response
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                        content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      const result = JSON.parse(jsonStr.trim());
      
      return {
        success: true,
        plan: result.plan,
        shoppingNeeded: result.shoppingNeeded || [],
        notes: result.notes || "",
      };
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse meal plan. Please try again.");
    }
  },
});

// Apply a generated plan to the database
export const applyPlan = action({
  args: {
    plan: v.array(
      v.object({
        date: v.string(),
        meals: v.array(
          v.object({
            type: v.string(),
            recipeId: v.optional(v.union(v.string(), v.null())),
            customMeal: v.optional(v.union(v.string(), v.null())),
            isLeftover: v.optional(v.boolean()),
          })
        ),
      })
    ),
    addToGroceryList: v.optional(v.boolean()),
    shoppingNeeded: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Apply each day's plan
    for (const day of args.plan) {
      const meals = day.meals.map((meal) => ({
        type: meal.type,
        recipeId: meal.recipeId ? meal.recipeId as Id<"recipes"> : undefined,
        customMeal: meal.customMeal || undefined,
        notes: meal.isLeftover ? "Leftovers" : undefined,
      }));
      
      await ctx.runMutation(api.mealPlans.setMeals, {
        date: day.date,
        meals,
      });
    }
    
    // Optionally add shopping items
    if (args.addToGroceryList && args.shoppingNeeded) {
      for (const item of args.shoppingNeeded) {
        await ctx.runMutation(api.groceryList.add, {
          name: item,
        });
      }
    }
    
    return { success: true, daysPlanned: args.plan.length };
  },
});

// Helper to build the prompt
function buildMealPlanPrompt(args: {
  recipes: any[];
  pantryItems: any[];
  expiringSoon: any[];
  daysToEatOut: number;
  eatingOutDays?: string[];
  householdSize: number;
  mealsPerDay: string[];
  preferQuickMeals?: boolean;
  useExpiring?: boolean;
  startDate: string;
  numDays: number;
}): string {
  const recipeList = args.recipes.map((r) => ({
    id: r._id,
    name: r.name,
    servings: r.servings || 2,
    prepTime: r.prepTime || 0,
    cookTime: r.cookTime || 0,
    totalTime: (r.prepTime || 0) + (r.cookTime || 0),
    tags: r.tags,
    ingredients: r.ingredients.map((i: any) => i.name),
  }));
  
  const pantryList = args.pantryItems.map((p) => p.name);
  const expiringList = args.expiringSoon.map((p) => ({
    name: p.name,
    daysLeft: Math.ceil((p.expiresAt! - Date.now()) / (24 * 60 * 60 * 1000)),
  }));
  
  return `
Generate a ${args.numDays}-day meal plan starting ${args.startDate}.

PREFERENCES:
- Household size: ${args.householdSize} people
- Meals to plan: ${args.mealsPerDay.join(", ")}
- Days eating out: ${args.daysToEatOut}${args.eatingOutDays?.length ? ` (preferably ${args.eatingOutDays.join(", ")})` : ""}
- Prefer quick meals on weekdays: ${args.preferQuickMeals ? "yes" : "no"}
- Prioritize expiring ingredients: ${args.useExpiring ? "yes" : "no"}

AVAILABLE RECIPES:
${JSON.stringify(recipeList, null, 2)}

PANTRY ITEMS:
${pantryList.join(", ")}

EXPIRING SOON:
${expiringList.map((e) => `${e.name} (${e.daysLeft} days)`).join(", ") || "None"}

Remember:
- Each person needs 1 serving per meal
- If a recipe makes ${args.householdSize * 2}+ servings, plan leftovers for the next day
- Use recipe IDs from the list above
- For eating out or leftovers, use customMeal field
`.trim();
}
