#!/usr/bin/env node
/**
 * Pantry CLI - Command line interface for the pantry app
 * Usage: pantry <command> [options]
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = "https://modest-starling-361.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

// Helper to format dates
const formatDate = (ts) => {
  if (!ts) return "-";
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  const dateStr = d.toLocaleDateString();
  if (diffDays < 0) return `${dateStr} (EXPIRED)`;
  if (diffDays === 0) return `${dateStr} (today!)`;
  if (diffDays <= 3) return `${dateStr} (${diffDays}d)`;
  return dateStr;
};

// Parse command line
const [,, command, ...args] = process.argv;

// Commands
const commands = {
  // === PANTRY ===
  async list() {
    const location = args.find(a => a.startsWith("--location="))?.split("=")[1];
    let items;
    if (location) {
      items = await client.query(api.pantry.byLocation, { location });
    } else {
      items = await client.query(api.pantry.list);
    }
    
    if (items.length === 0) {
      console.log("No items in pantry");
      return;
    }

    // Group by location
    const grouped = {};
    for (const item of items) {
      if (!grouped[item.location]) grouped[item.location] = [];
      grouped[item.location].push(item);
    }

    for (const [loc, locItems] of Object.entries(grouped)) {
      console.log(`\n📍 ${loc.toUpperCase()}`);
      for (const item of locItems) {
        const qty = item.quantity ? ` (${item.quantity})` : "";
        const exp = item.expiresAt ? ` | exp: ${formatDate(item.expiresAt)}` : "";
        console.log(`  • ${item.name}${qty}${exp}`);
      }
    }
  },

  async expiring() {
    const days = parseInt(args.find(a => a.startsWith("--days="))?.split("=")[1] || "7");
    const items = await client.query(api.pantry.expiringSoon, { withinDays: days });
    
    if (items.length === 0) {
      console.log(`Nothing expiring in the next ${days} days 👍`);
      return;
    }

    console.log(`⚠️  Expiring within ${days} days:`);
    for (const item of items) {
      console.log(`  • ${item.name} (${item.location}) - ${formatDate(item.expiresAt)}`);
    }
  },

  async add() {
    const name = args[0];
    if (!name) {
      console.error("Usage: pantry add <name> [--qty=X] [--location=X] [--expires=YYYY-MM-DD]");
      process.exit(1);
    }

    const quantity = args.find(a => a.startsWith("--qty="))?.split("=")[1];
    const location = args.find(a => a.startsWith("--location="))?.split("=")[1] || "pantry";
    const expiresStr = args.find(a => a.startsWith("--expires="))?.split("=")[1];
    const expiresAt = expiresStr ? new Date(expiresStr).getTime() : undefined;

    await client.mutation(api.pantry.add, { name, quantity, location, expiresAt });
    console.log(`✓ Added ${name} to ${location}`);
  },

  async rm() {
    const id = args[0];
    if (!id) {
      console.error("Usage: pantry rm <id>");
      process.exit(1);
    }
    await client.mutation(api.pantry.remove, { id });
    console.log("✓ Removed");
  },

  async use() {
    const id = args[0];
    if (!id) {
      console.error("Usage: pantry use <id>");
      process.exit(1);
    }
    await client.mutation(api.pantry.use, { id });
    console.log("✓ Used item");
  },

  // === RECIPES ===
  async recipes() {
    const subcommand = args[0];
    
    if (subcommand === "search") {
      const query = args.slice(1).join(" ");
      const recipes = await client.query(api.recipes.search, { query });
      if (recipes.length === 0) {
        console.log("No recipes found");
        return;
      }
      for (const r of recipes) {
        const tags = r.tags.length ? ` [${r.tags.join(", ")}]` : "";
        console.log(`• ${r.name}${tags} (${r._id})`);
      }
    } else if (subcommand === "can-make") {
      const results = await client.query(api.recipes.canMake);
      const canMake = results.filter(r => r.canMake);
      const almostCanMake = results.filter(r => !r.canMake && r.missingCount <= 3);

      if (canMake.length > 0) {
        console.log("✅ CAN MAKE NOW:");
        for (const r of canMake) {
          console.log(`  • ${r.name}`);
        }
      }

      if (almostCanMake.length > 0) {
        console.log("\n🔶 ALMOST (missing 1-3 ingredients):");
        for (const r of almostCanMake) {
          console.log(`  • ${r.name} — need: ${r.missing.join(", ")}`);
        }
      }
    } else if (subcommand === "view") {
      const id = args[1];
      if (!id) {
        console.error("Usage: pantry recipes view <id>");
        process.exit(1);
      }
      const recipe = await client.query(api.recipes.get, { id });
      if (!recipe) {
        console.log("Recipe not found");
        return;
      }
      console.log(`\n📖 ${recipe.name}`);
      if (recipe.source) console.log(`   Source: ${recipe.source}`);
      if (recipe.prepTime || recipe.cookTime) {
        console.log(`   Time: ${recipe.prepTime || 0}m prep + ${recipe.cookTime || 0}m cook`);
      }
      console.log("\nIngredients:");
      for (const ing of recipe.ingredients) {
        const opt = ing.optional ? " (optional)" : "";
        console.log(`  • ${ing.quantity} ${ing.name}${opt}`);
      }
      console.log("\nInstructions:");
      recipe.instructions.forEach((step, i) => {
        console.log(`  ${i + 1}. ${step}`);
      });
    } else {
      // List all recipes
      const recipes = await client.query(api.recipes.list);
      if (recipes.length === 0) {
        console.log("No recipes");
        return;
      }
      for (const r of recipes) {
        const tags = r.tags.length ? ` [${r.tags.join(", ")}]` : "";
        console.log(`• ${r.name}${tags}`);
      }
    }
  },

  // === GROCERY ===
  async grocery() {
    const subcommand = args[0];

    if (subcommand === "add") {
      const name = args[1];
      if (!name) {
        console.error("Usage: pantry grocery add <name> [--qty=X]");
        process.exit(1);
      }
      const quantity = args.find(a => a.startsWith("--qty="))?.split("=")[1];
      await client.mutation(api.groceryList.add, { name, quantity });
      console.log(`✓ Added ${name} to grocery list`);
    } else if (subcommand === "check") {
      const id = args[1];
      if (!id) {
        console.error("Usage: pantry grocery check <id>");
        process.exit(1);
      }
      await client.mutation(api.groceryList.toggle, { id });
      console.log("✓ Toggled");
    } else if (subcommand === "clear") {
      await client.mutation(api.groceryList.clearChecked);
      console.log("✓ Cleared checked items");
    } else if (subcommand === "from-recipe") {
      const recipeId = args[1];
      if (!recipeId) {
        console.error("Usage: pantry grocery from-recipe <recipe-id>");
        process.exit(1);
      }
      await client.mutation(api.groceryList.addFromRecipe, { recipeId });
      console.log("✓ Added missing ingredients to grocery list");
    } else {
      // List
      const items = await client.query(api.groceryList.list);
      if (items.length === 0) {
        console.log("Grocery list is empty");
        return;
      }
      console.log("🛒 GROCERY LIST:");
      for (const item of items) {
        const check = item.checked ? "✓" : "○";
        const qty = item.quantity ? ` (${item.quantity})` : "";
        console.log(`  ${check} ${item.name}${qty}`);
      }
    }
  },

  // === MEALS ===
  async meals() {
    const subcommand = args[0];

    if (subcommand === "week") {
      const today = new Date();
      const startDate = today.toISOString().split("T")[0];
      const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      
      const plans = await client.query(api.mealPlans.getWeek, { startDate, endDate });
      const recipes = await client.query(api.recipes.list);
      const recipeMap = Object.fromEntries(recipes.map(r => [r._id, r.name]));

      for (let i = 0; i < 7; i++) {
        const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split("T")[0];
        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
        const plan = plans.find(p => p.date === dateStr);

        console.log(`\n${dayName} ${dateStr}:`);
        if (!plan || plan.meals.length === 0) {
          console.log("  (no meals planned)");
        } else {
          for (const meal of plan.meals) {
            const mealName = meal.recipeId ? recipeMap[meal.recipeId] : meal.customMeal;
            console.log(`  ${meal.type}: ${mealName || "?"}`);
          }
        }
      }
    } else if (subcommand === "plan") {
      const date = args[1];
      const mealType = args.find(a => a.startsWith("--"))?.slice(2);
      const mealValue = args[args.indexOf(`--${mealType}`) + 1];

      if (!date || !mealType || !mealValue) {
        console.error("Usage: pantry meals plan <date> --breakfast|--lunch|--dinner <recipe-id or 'custom meal'>");
        process.exit(1);
      }

      const isRecipeId = mealValue.startsWith("j"); // Convex IDs start with letters
      await client.mutation(api.mealPlans.addMeal, {
        date,
        type: mealType,
        recipeId: isRecipeId ? mealValue : undefined,
        customMeal: isRecipeId ? undefined : mealValue,
      });
      console.log(`✓ Planned ${mealType} for ${date}`);
    } else if (subcommand === "shopping") {
      const today = new Date();
      const startDate = today.toISOString().split("T")[0];
      const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      
      const list = await client.query(api.mealPlans.getGroceryList, { startDate, endDate });
      if (list.length === 0) {
        console.log("No shopping needed for this week's meals");
        return;
      }
      console.log("🛒 SHOPPING LIST FOR MEAL PLAN:");
      for (const item of list) {
        console.log(`  • ${item.name} (${item.quantity})`);
      }
    } else {
      // Today's meals
      const today = new Date().toISOString().split("T")[0];
      const plan = await client.query(api.mealPlans.getByDate, { date: today });
      const recipes = await client.query(api.recipes.list);
      const recipeMap = Object.fromEntries(recipes.map(r => [r._id, r.name]));

      console.log(`📅 Today (${today}):`);
      if (!plan || plan.meals.length === 0) {
        console.log("  No meals planned");
      } else {
        for (const meal of plan.meals) {
          const mealName = meal.recipeId ? recipeMap[meal.recipeId] : meal.customMeal;
          console.log(`  ${meal.type}: ${mealName || "?"}`);
        }
      }
    }
  },

  // Help
  async help() {
    console.log(`
Pantry CLI

PANTRY:
  pantry list [--location=fridge|freezer|pantry|spices]
  pantry expiring [--days=7]
  pantry add <name> [--qty=X] [--location=X] [--expires=YYYY-MM-DD]
  pantry rm <id>
  pantry use <id>

RECIPES:
  pantry recipes                    List all recipes
  pantry recipes search <query>     Search recipes
  pantry recipes view <id>          View recipe details
  pantry recipes can-make           What can I cook with current pantry?

GROCERY:
  pantry grocery                    Show grocery list
  pantry grocery add <name> [--qty=X]
  pantry grocery check <id>         Toggle checked status
  pantry grocery clear              Remove checked items
  pantry grocery from-recipe <id>   Add missing ingredients

MEALS:
  pantry meals                      Today's meal plan
  pantry meals week                 This week's plan
  pantry meals plan <date> --dinner <recipe-id or "meal name">
  pantry meals shopping             Shopping list for the week
`);
  }
};

// Run command
const cmd = commands[command];
if (!cmd) {
  commands.help();
  process.exit(command ? 1 : 0);
}

cmd().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
