# Pantry App

Kitchen inventory & recipe manager with real-time sync via Convex.

## Features

- **Pantry Tracking**: Track items by location (fridge, freezer, pantry, spices)
- **Expiry Alerts**: See what's expiring soon, color-coded by urgency
- **Recipe Manager**: Store recipes with ingredients and instructions
- **Smart Matching**: See which recipes you can make with current inventory
- **Grocery List**: Auto-generate shopping lists from recipes, excluding what you have

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: Convex (real-time database)
- **Icons**: Lucide React

## Setup

```bash
# Install dependencies
npm install

# Start Convex dev server (creates convex/ generated files)
npx convex dev

# In another terminal, start Next.js
npm run dev
```

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
```

## Usage

### Adding Pantry Items
1. Click "Add Item" 
2. Enter name, quantity, location, and days until expiry
3. Item appears in list with expiry countdown

### Managing Recipes
- Recipes show how many ingredients you have vs. need
- "Can Make!" badge appears when you have all required ingredients
- Click "Add missing to grocery list" to add what you need

### Grocery List
- Check off items as you shop
- Clear checked items when done
- Items from recipes link back to the source

---

Built by Jack + Hex 🦎
