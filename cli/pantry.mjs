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

  async edit() {
    const id = args[0];
    if (!id) {
      console.error("Usage: pantry edit <id> [--name=X] [--qty=X] [--location=X] [--expires=YYYY-MM-DD]");
      process.exit(1);
    }

    const name = args.find(a => a.startsWith("--name="))?.split("=")[1];
    const quantity = args.find(a => a.startsWith("--qty="))?.split("=")[1];
    const location = args.find(a => a.startsWith("--location="))?.split("=")[1];
    const expiresStr = args.find(a => a.startsWith("--expires="))?.split("=")[1];
    const expiresAt = expiresStr ? new Date(expiresStr).getTime() : undefined;

    if (!name && !quantity && !location && !expiresAt) {
      console.error("Provide at least one field to update");
      process.exit(1);
    }

    await client.mutation(api.pantry.update, { id, name, quantity, location, expiresAt });
    console.log("✓ Updated item");
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
    } else if (subcommand === "add") {
      // Interactive-ish recipe add using JSON file or inline
      const jsonPath = args.find(a => a.startsWith("--json="))?.split("=")[1];
      
      if (jsonPath) {
        const fs = await import("fs/promises");
        const data = JSON.parse(await fs.readFile(jsonPath, "utf-8"));
        const id = await client.mutation(api.recipes.add, {
          name: data.name,
          source: data.source,
          servings: data.servings,
          prepTime: data.prepTime,
          cookTime: data.cookTime,
          tags: data.tags || [],
          ingredients: data.ingredients || [],
          instructions: data.instructions || [],
          notes: data.notes,
        });
        console.log(`✓ Added recipe: ${data.name} (${id})`);
      } else {
        console.error("Usage: pantry recipes add --json=recipe.json");
        console.log(`
Example recipe.json:
{
  "name": "Pasta",
  "source": "https://...",
  "servings": 4,
  "prepTime": 10,
  "cookTime": 20,
  "tags": ["italian", "quick"],
  "ingredients": [
    { "name": "pasta", "quantity": "1 lb" },
    { "name": "garlic", "quantity": "3 cloves", "optional": true }
  ],
  "instructions": [
    "Boil water",
    "Cook pasta"
  ]
}`);
        process.exit(1);
      }
    } else if (subcommand === "edit") {
      const id = args[1];
      if (!id) {
        console.error("Usage: pantry recipes edit <id> [--name=X] [--json=updates.json]");
        process.exit(1);
      }

      const name = args.find(a => a.startsWith("--name="))?.split("=")[1];
      const jsonPath = args.find(a => a.startsWith("--json="))?.split("=")[1];
      const tagsStr = args.find(a => a.startsWith("--tags="))?.split("=")[1];
      const tags = tagsStr ? tagsStr.split(",") : undefined;
      const servings = args.find(a => a.startsWith("--servings="))?.split("=")[1];
      const prepTime = args.find(a => a.startsWith("--prep="))?.split("=")[1];
      const cookTime = args.find(a => a.startsWith("--cook="))?.split("=")[1];
      const source = args.find(a => a.startsWith("--source="))?.split("=")[1];

      let updates = { id };
      
      if (jsonPath) {
        const fs = await import("fs/promises");
        const data = JSON.parse(await fs.readFile(jsonPath, "utf-8"));
        updates = { id, ...data };
      } else {
        if (name) updates.name = name;
        if (tags) updates.tags = tags;
        if (servings) updates.servings = parseInt(servings);
        if (prepTime) updates.prepTime = parseInt(prepTime);
        if (cookTime) updates.cookTime = parseInt(cookTime);
        if (source) updates.source = source;
      }

      if (Object.keys(updates).length <= 1) {
        console.error("Provide fields to update or use --json=file.json");
        process.exit(1);
      }

      await client.mutation(api.recipes.update, updates);
      console.log("✓ Updated recipe");
    } else if (subcommand === "rm" || subcommand === "delete") {
      const id = args[1];
      if (!id) {
        console.error("Usage: pantry recipes rm <id>");
        process.exit(1);
      }
      await client.mutation(api.recipes.remove, { id });
      console.log("✓ Deleted recipe");
    } else {
      // List all recipes
      const recipes = await client.query(api.recipes.list);
      if (recipes.length === 0) {
        console.log("No recipes");
        return;
      }
      for (const r of recipes) {
        const tags = r.tags.length ? ` [${r.tags.join(", ")}]` : "";
        console.log(`• ${r.name}${tags} (${r._id})`);
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

    if (subcommand === "generate") {
      // AI meal plan generation
      const householdSize = parseInt(args.find(a => a.startsWith("--people="))?.split("=")[1] || "2");
      const eatingOutDays = parseInt(args.find(a => a.startsWith("--eating-out="))?.split("=")[1] || "1");
      const days = parseInt(args.find(a => a.startsWith("--days="))?.split("=")[1] || "7");
      const quickWeekdays = args.includes("--quick-weekdays");
      const useExpiring = args.includes("--use-expiring");
      
      const today = new Date();
      const startDate = today.toISOString().split("T")[0];
      
      console.log(`🤖 Generating ${days}-day meal plan for ${householdSize} people...`);
      console.log(`   Eating out: ${eatingOutDays} days`);
      if (quickWeekdays) console.log(`   Preferring quick meals on weekdays`);
      if (useExpiring) console.log(`   Prioritizing expiring ingredients`);
      console.log("");
      
      try {
        const result = await client.action(api.mealPlanGenerator.generate, {
          daysToEatOut: eatingOutDays,
          householdSize,
          mealsPerDay: ["dinner"],
          preferQuickMeals: quickWeekdays,
          useExpiring,
          startDate,
          numDays: days,
        });
        
        if (result.success) {
          console.log("✅ Generated meal plan:\n");
          
          const recipes = await client.query(api.recipes.list);
          const recipeMap = Object.fromEntries(recipes.map(r => [r._id, r]));
          
          for (const day of result.plan) {
            const d = new Date(day.date);
            const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
            console.log(`${dayName} ${day.date}:`);
            for (const meal of day.meals) {
              const recipe = meal.recipeId ? recipeMap[meal.recipeId] : null;
              const mealName = recipe ? recipe.name : meal.customMeal;
              const leftover = meal.isLeftover ? " 🔄" : "";
              const servings = recipe?.servings ? ` (${recipe.servings} servings)` : "";
              console.log(`  ${meal.type}: ${mealName}${leftover}${servings}`);
            }
          }
          
          if (result.shoppingNeeded?.length > 0) {
            console.log("\n🛒 Shopping needed:");
            for (const item of result.shoppingNeeded) {
              console.log(`  • ${item}`);
            }
          }
          
          if (result.notes) {
            console.log(`\n📝 ${result.notes}`);
          }
          
          console.log("\nApply this plan? Run: pantry meals apply-generated");
          // Store in temp for apply command
          const fs = await import("fs/promises");
          await fs.writeFile("/tmp/pantry-generated-plan.json", JSON.stringify(result));
        }
      } catch (err) {
        console.error("Error generating plan:", err.message);
        process.exit(1);
      }
      return;
    }

    if (subcommand === "apply-generated") {
      const fs = await import("fs/promises");
      try {
        const data = await fs.readFile("/tmp/pantry-generated-plan.json", "utf-8");
        const result = JSON.parse(data);
        
        const addGrocery = args.includes("--add-grocery");
        
        await client.action(api.mealPlanGenerator.applyPlan, {
          plan: result.plan,
          addToGroceryList: addGrocery,
          shoppingNeeded: result.shoppingNeeded,
        });
        
        console.log("✅ Meal plan applied!");
        if (addGrocery && result.shoppingNeeded?.length > 0) {
          console.log(`   Added ${result.shoppingNeeded.length} items to grocery list`);
        }
        
        await fs.unlink("/tmp/pantry-generated-plan.json");
      } catch (err) {
        console.error("No generated plan to apply. Run: pantry meals generate");
        process.exit(1);
      }
      return;
    }

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
  pantry edit <id> [--name=X] [--qty=X] [--location=X] [--expires=YYYY-MM-DD]
  pantry rm <id>
  pantry use <id>

RECIPES:
  pantry recipes                    List all recipes
  pantry recipes search <query>     Search recipes
  pantry recipes view <id>          View recipe details
  pantry recipes can-make           What can I cook with current pantry?
  pantry recipes add --json=file    Add recipe from JSON file
  pantry recipes edit <id> [opts]   Edit recipe (--name, --tags, --servings, etc or --json)
  pantry recipes rm <id>            Delete recipe

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

AI MEAL PLANNING:
  pantry meals generate [options]   Generate a meal plan with AI
    --people=N                      Household size (default: 2)
    --eating-out=N                  Days eating out (default: 1)
    --days=N                        Days to plan (default: 7)
    --quick-weekdays                Prefer quick meals Mon-Fri
    --use-expiring                  Prioritize expiring ingredients
  
  pantry meals apply-generated      Apply the last generated plan
    --add-grocery                   Also add shopping items to grocery list
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
