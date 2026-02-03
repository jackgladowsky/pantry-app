# 🥫 Pantry

A smart kitchen inventory and recipe manager. Track what you have, find what you can cook, and never let food go to waste.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Convex](https://img.shields.io/badge/Convex-Backend-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

## Features

### 📦 Inventory Tracking
- Organize items by location: fridge, freezer, pantry, spices
- Track quantities and expiration dates
- Color-coded expiry warnings (red/yellow/green)
- Quick "use" action to remove items as you cook

### 🍳 Recipe Management
- Store recipes with ingredients, instructions, prep/cook times
- Tag-based organization
- Full-text search
- **Smart matching**: instantly see which recipes you can make with what's on hand

### 🛒 Grocery Lists
- Auto-generate shopping lists from recipes
- Automatically excludes items you already have
- Check off items as you shop
- Link items back to their source recipe

### 📅 Meal Planning
- Plan meals by day (breakfast, lunch, dinner)
- Weekly calendar view
- Generate shopping lists for your meal plan

### 💻 CLI Access
Full command-line interface for quick access and automation:
```bash
pantry list                    # Show all items by location
pantry expiring --days=7       # What's going bad soon?
pantry recipes can-make        # What can I cook right now?
pantry grocery from-recipe ID  # Add missing ingredients to list
```

## Quick Start

### Prerequisites
- Node.js 18+
- A [Convex](https://convex.dev) account (free tier works great)

### Installation

```bash
# Clone the repo
git clone https://github.com/jackgladowsky/pantry-app.git
cd pantry-app

# Install dependencies
npm install

# Set up Convex (follow the prompts to create a new project)
npx convex dev
```

### Environment Setup

Create `.env.local`:
```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### Running

```bash
# Terminal 1: Convex backend (keeps schema in sync)
npx convex dev

# Terminal 2: Next.js frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you're ready to go.

## CLI Reference

The CLI lives at `cli/pantry.mjs` and talks directly to your Convex backend.

### Pantry Commands

```bash
# List everything, grouped by location
pantry list

# Filter by location
pantry list --location=fridge

# What's expiring soon?
pantry expiring              # Default: 7 days
pantry expiring --days=3

# Add an item
pantry add "Milk" --qty="1 gallon" --location=fridge --expires=2026-02-10

# Remove an item
pantry rm <item-id>
```

### Recipe Commands

```bash
# List all recipes
pantry recipes

# Search recipes
pantry recipes search "chicken"

# View full recipe
pantry recipes view <recipe-id>

# What can I make with current inventory?
pantry recipes can-make
```

### Grocery Commands

```bash
# View grocery list
pantry grocery

# Add item manually
pantry grocery add "Eggs" --qty="1 dozen"

# Add missing ingredients from a recipe
pantry grocery from-recipe <recipe-id>

# Check/uncheck an item
pantry grocery check <item-id>

# Clear all checked items
pantry grocery clear
```

### Meal Planning Commands

```bash
# Today's meals
pantry meals

# This week's plan
pantry meals week

# Plan a meal
pantry meals plan 2026-02-05 --dinner <recipe-id>
pantry meals plan 2026-02-05 --lunch "Leftover pizza"

# Generate shopping list for the week
pantry meals shopping
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React 19, Tailwind CSS 4 |
| Backend | Convex (real-time sync, serverless) |
| Icons | Lucide React |
| CLI | Node.js (ESM) |

## Project Structure

```
pantry-app/
├── app/                  # Next.js app router pages
├── convex/               # Convex backend
│   ├── schema.ts         # Database schema
│   ├── pantry.ts         # Pantry queries/mutations
│   ├── recipes.ts        # Recipe queries/mutations
│   ├── groceryList.ts    # Grocery list logic
│   └── mealPlans.ts      # Meal planning logic
├── cli/
│   └── pantry.mjs        # CLI tool
└── README.md
```

## Data Model

**pantryItems**: Items with name, quantity, location, expiry date
**recipes**: Name, ingredients (with quantities), instructions, tags, times
**groceryList**: Shopping items with checked status, optional recipe link
**mealPlans**: Daily meal schedules linking to recipes or custom meals

## Roadmap

- [ ] Barcode scanning for quick item entry
- [ ] Receipt OCR for bulk import
- [ ] Nutrition tracking
- [ ] Recipe suggestions based on expiring items
- [ ] Shared household support
- [ ] Mobile app (React Native)

## Contributing

PRs welcome! Please open an issue first to discuss major changes.

## License

MIT © Jack Gladowsky

---

Built by Jack + [Hex](https://github.com/jackgladowsky/hex) 🦎
