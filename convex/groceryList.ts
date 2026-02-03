import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all grocery items
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("groceryList")
      .order("desc")
      .collect();
  },
});

// Add item to grocery list
export const add = mutation({
  args: {
    name: v.string(),
    quantity: v.optional(v.string()),
    recipeId: v.optional(v.id("recipes")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("groceryList", {
      ...args,
      checked: false,
      addedAt: Date.now(),
    });
  },
});

// Toggle checked status
export const toggle = mutation({
  args: { id: v.id("groceryList") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (item) {
      await ctx.db.patch(args.id, { checked: !item.checked });
    }
  },
});

// Update item
export const update = mutation({
  args: {
    id: v.id("groceryList"),
    name: v.optional(v.string()),
    quantity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, cleanUpdates);
  },
});

// Remove item
export const remove = mutation({
  args: { id: v.id("groceryList") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Clear checked items
export const clearChecked = mutation({
  args: {},
  handler: async (ctx) => {
    const checked = await ctx.db
      .query("groceryList")
      .withIndex("by_checked", (q) => q.eq("checked", true))
      .collect();
    
    for (const item of checked) {
      await ctx.db.delete(item._id);
    }
  },
});

// Add ingredients from a recipe to grocery list (merges with existing items)
export const addFromRecipe = mutation({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) return;
    
    // Get current pantry to exclude items we already have
    const pantryItems = await ctx.db.query("pantryItems").collect();
    const pantryNames = new Set(
      pantryItems.map((item) => item.name.toLowerCase())
    );
    
    // Get current grocery list for merging
    const groceryItems = await ctx.db.query("groceryList").collect();
    const groceryByName = new Map(
      groceryItems.map((item) => [item.name.toLowerCase(), item])
    );
    
    for (const ingredient of recipe.ingredients) {
      const nameLower = ingredient.name.toLowerCase();
      
      // Skip if we have it in pantry
      if (pantryNames.has(nameLower)) continue;
      
      // Check if already in grocery list
      const existing = groceryByName.get(nameLower);
      if (existing) {
        // Merge quantities if both exist
        const newQty = mergeQuantities(existing.quantity, ingredient.quantity);
        await ctx.db.patch(existing._id, { quantity: newQty });
      } else {
        await ctx.db.insert("groceryList", {
          name: ingredient.name,
          quantity: ingredient.quantity,
          recipeId: args.recipeId,
          checked: false,
          addedAt: Date.now(),
        });
      }
    }
  },
});

// Helper to merge quantity strings (best effort)
function mergeQuantities(q1: string | undefined, q2: string): string {
  if (!q1) return q2;
  
  // Try to parse numbers and add them
  const num1 = parseFloat(q1);
  const num2 = parseFloat(q2);
  
  if (!isNaN(num1) && !isNaN(num2)) {
    // Extract unit from q1 if possible
    const unit = q1.replace(/[\d.\/\s]+/, '').trim();
    const sum = num1 + num2;
    return unit ? `${sum} ${unit}` : `${sum}`;
  }
  
  // Can't merge numerically, just concatenate
  return `${q1} + ${q2}`;
}
