import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all pantry items
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pantryItems").collect();
  },
});

// Get items by location
export const byLocation = query({
  args: { location: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pantryItems")
      .withIndex("by_location", (q) => q.eq("location", args.location))
      .collect();
  },
});

// Get expiring items (within N days)
export const expiringSoon = query({
  args: { withinDays: v.number() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const cutoff = now + args.withinDays * 24 * 60 * 60 * 1000;
    
    const items = await ctx.db
      .query("pantryItems")
      .withIndex("by_expiry")
      .collect();
    
    return items
      .filter((item) => item.expiresAt && item.expiresAt <= cutoff)
      .sort((a, b) => (a.expiresAt || 0) - (b.expiresAt || 0));
  },
});

// Add item
export const add = mutation({
  args: {
    name: v.string(),
    quantity: v.optional(v.string()),
    location: v.string(),
    expiresAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pantryItems", {
      ...args,
      addedAt: Date.now(),
    });
  },
});

// Update item
export const update = mutation({
  args: {
    id: v.id("pantryItems"),
    name: v.optional(v.string()),
    quantity: v.optional(v.string()),
    location: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, cleanUpdates);
  },
});

// Remove item
export const remove = mutation({
  args: { id: v.id("pantryItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Use item (decrease quantity or remove)
export const use = mutation({
  args: { id: v.id("pantryItems") },
  handler: async (ctx, args) => {
    // For simplicity, just remove the item
    // Could be enhanced to track partial usage
    await ctx.db.delete(args.id);
  },
});
