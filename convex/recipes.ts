import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all recipes
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("recipes").collect();
  },
});

// Get single recipe
export const get = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Search recipes by name
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query.trim()) {
      return await ctx.db.query("recipes").collect();
    }
    return await ctx.db
      .query("recipes")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .collect();
  },
});

// Add recipe
export const add = mutation({
  args: {
    name: v.string(),
    source: v.optional(v.string()),
    servings: v.optional(v.number()),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    tags: v.array(v.string()),
    ingredients: v.array(
      v.object({
        name: v.string(),
        quantity: v.string(),
        optional: v.optional(v.boolean()),
      })
    ),
    instructions: v.array(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("recipes", args);
  },
});

// Update recipe
export const update = mutation({
  args: {
    id: v.id("recipes"),
    name: v.optional(v.string()),
    source: v.optional(v.string()),
    servings: v.optional(v.number()),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    ingredients: v.optional(
      v.array(
        v.object({
          name: v.string(),
          quantity: v.string(),
          optional: v.optional(v.boolean()),
        })
      )
    ),
    instructions: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, cleanUpdates);
  },
});

// Delete recipe
export const remove = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get recipes you can make with current pantry
export const canMake = query({
  args: {},
  handler: async (ctx) => {
    const recipes = await ctx.db.query("recipes").collect();
    const pantryItems = await ctx.db.query("pantryItems").collect();
    
    const pantryNames = new Set(
      pantryItems.map((item) => item.name.toLowerCase())
    );
    
    return recipes.map((recipe) => {
      const requiredIngredients = recipe.ingredients.filter((i) => !i.optional);
      const haveCount = requiredIngredients.filter((i) =>
        pantryNames.has(i.name.toLowerCase())
      ).length;
      const missingCount = requiredIngredients.length - haveCount;
      const missing = requiredIngredients
        .filter((i) => !pantryNames.has(i.name.toLowerCase()))
        .map((i) => i.name);
      
      return {
        ...recipe,
        haveCount,
        missingCount,
        missing,
        canMake: missingCount === 0,
      };
    }).sort((a, b) => a.missingCount - b.missingCount);
  },
});
