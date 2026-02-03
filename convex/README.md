# Convex Backend

This directory contains all the Convex functions (queries and mutations) that power the Pantry app.

## Schema

Defined in `schema.ts`:

- **pantryItems** — Kitchen inventory with location, quantity, expiry
- **recipes** — Recipes with ingredients, instructions, tags
- **groceryList** — Shopping list items with checked status
- **mealPlans** — Daily meal schedules

## Modules

### `pantry.ts`
- `list` — Get all pantry items
- `byLocation` — Filter items by location (fridge/freezer/pantry/spices)
- `expiringSoon` — Items expiring within N days
- `add` / `update` / `remove` / `use` — CRUD operations

### `recipes.ts`
- `list` / `get` / `search` — Query recipes
- `add` / `update` / `remove` — CRUD operations
- `canMake` — Returns recipes sorted by how many ingredients you're missing

### `groceryList.ts`
- `list` — Get all grocery items
- `add` / `toggle` / `update` / `remove` — CRUD operations
- `clearChecked` — Remove all checked items
- `addFromRecipe` — Add missing ingredients from a recipe

### `mealPlans.ts`
- `getByDate` / `getWeek` — Query meal plans
- `setMeals` / `addMeal` / `removeMeal` / `clearDay` — Manage meals
- `getGroceryList` — Generate shopping list for planned meals

## Development

```bash
# Start the Convex dev server (watches for changes)
npx convex dev

# Push to production
npx convex deploy
```

## Indexes

- `pantryItems.by_location` — Fast filtering by storage location
- `pantryItems.by_expiry` — Sorted expiry queries
- `recipes.by_tag` — Filter by tag
- `recipes.search_name` — Full-text search on recipe names
- `mealPlans.by_date` — Date-based lookups
- `groceryList.by_checked` — Filter checked/unchecked items
