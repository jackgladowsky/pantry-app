import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get meal plan for a specific date
export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mealPlans")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();
  },
});

// Get meal plans for a date range (for weekly view)
export const getWeek = query({
  args: { startDate: v.string(), endDate: v.string() },
  handler: async (ctx, args) => {
    const plans = await ctx.db
      .query("mealPlans")
      .withIndex("by_date")
      .collect();
    
    return plans.filter(
      (p) => p.date >= args.startDate && p.date <= args.endDate
    );
  },
});

// Set meal plan for a date (create or update)
export const setMeals = mutation({
  args: {
    date: v.string(),
    meals: v.array(
      v.object({
        type: v.string(),
        recipeId: v.optional(v.id("recipes")),
        customMeal: v.optional(v.string()),
        notes: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("mealPlans")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { meals: args.meals });
      return existing._id;
    } else {
      return await ctx.db.insert("mealPlans", {
        date: args.date,
        meals: args.meals,
      });
    }
  },
});

// Add a single meal to a date
export const addMeal = mutation({
  args: {
    date: v.string(),
    type: v.string(),
    recipeId: v.optional(v.id("recipes")),
    customMeal: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { date, ...meal } = args;
    
    const existing = await ctx.db
      .query("mealPlans")
      .withIndex("by_date", (q) => q.eq("date", date))
      .first();

    if (existing) {
      const meals = [...existing.meals, meal];
      await ctx.db.patch(existing._id, { meals });
    } else {
      await ctx.db.insert("mealPlans", {
        date,
        meals: [meal],
      });
    }
  },
});

// Remove a meal from a date
export const removeMeal = mutation({
  args: {
    date: v.string(),
    mealIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("mealPlans")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    if (existing) {
      const meals = existing.meals.filter((_, i) => i !== args.mealIndex);
      await ctx.db.patch(existing._id, { meals });
    }
  },
});

// Clear all meals for a date
export const clearDay = mutation({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("mealPlans")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

// Get grocery list for planned meals in a date range
export const getGroceryList = query({
  args: { startDate: v.string(), endDate: v.string() },
  handler: async (ctx, args) => {
    const plans = await ctx.db
      .query("mealPlans")
      .withIndex("by_date")
      .collect();

    const weekPlans = plans.filter(
      (p) => p.date >= args.startDate && p.date <= args.endDate
    );

    // Get all recipe IDs from the meal plans
    const recipeIds = new Set<string>();
    for (const plan of weekPlans) {
      for (const meal of plan.meals) {
        if (meal.recipeId) {
          recipeIds.add(meal.recipeId);
        }
      }
    }

    // Fetch all recipes
    const ingredients: Map<string, { name: string; quantity: string; count: number }> = new Map();
    
    for (const recipeId of recipeIds) {
      const recipe = await ctx.db.get(recipeId as any);
      if (recipe && "ingredients" in recipe) {
        for (const ing of recipe.ingredients as Array<{ name: string; quantity: string }>) {
          const key = ing.name.toLowerCase();
          if (ingredients.has(key)) {
            const existing = ingredients.get(key)!;
            existing.count += 1;
          } else {
            ingredients.set(key, { name: ing.name, quantity: ing.quantity, count: 1 });
          }
        }
      }
    }

    // Get pantry items to exclude what we already have
    const pantryItems = await ctx.db.query("pantryItems").collect();
    const pantryNames = new Set(pantryItems.map((i) => i.name.toLowerCase()));

    // Return ingredients we need to buy
    return Array.from(ingredients.values())
      .filter((ing) => !pantryNames.has(ing.name.toLowerCase()))
      .map((ing) => ({
        name: ing.name,
        quantity: ing.count > 1 ? `${ing.quantity} (×${ing.count})` : ing.quantity,
        have: false,
      }));
  },
});
