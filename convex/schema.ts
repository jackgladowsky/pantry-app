import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Pantry items (fridge, freezer, dry goods, etc.)
  pantryItems: defineTable({
    name: v.string(),
    quantity: v.optional(v.string()),
    location: v.string(), // "fridge" | "freezer" | "pantry" | "spices"
    addedAt: v.number(), // timestamp
    expiresAt: v.optional(v.number()), // timestamp
    notes: v.optional(v.string()),
    imageUrl: v.optional(v.string()), // legacy field
  })
    .index("by_location", ["location"])
    .index("by_expiry", ["expiresAt"]),

  // Recipes
  recipes: defineTable({
    name: v.string(),
    source: v.optional(v.string()),
    servings: v.optional(v.number()),
    prepTime: v.optional(v.number()), // minutes
    cookTime: v.optional(v.number()), // minutes
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
    imageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()), // AI-generated image
  })
    .index("by_tag", ["tags"])
    .searchIndex("search_name", { searchField: "name" }),

  // Grocery list items
  groceryList: defineTable({
    name: v.string(),
    quantity: v.optional(v.string()),
    checked: v.boolean(),
    recipeId: v.optional(v.id("recipes")), // which recipe it came from
    addedAt: v.number(),
  })
    .index("by_checked", ["checked"]),
});
