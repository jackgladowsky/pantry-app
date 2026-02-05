"use client";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { format, formatDistanceToNow } from "date-fns";
import {
  Home, Refrigerator, BookOpen, CalendarDays, ShoppingCart,
  Plus, Check, AlertTriangle, Sparkles, X, ChefHat, Clock,
  Users, Trash2, ChevronRight, Pencil, Snowflake, Package, Flame,
  ChevronLeft
} from "lucide-react";

// ============ SKELETON ============
function Skeleton({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? ""}`} />;
}

// ============ MAIN APP ============
export default function App() {
  const [activeView, setActiveView] = useState<"home" | "pantry" | "recipes" | "plan" | "grocery">("home");
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const goToRecipe = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    setActiveView("recipes");
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--bg)]/80 border-b border-[var(--border)]/40">
        <div className="max-w-[540px] mx-auto px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white">
              <ChefHat size={20} />
            </div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Kitchen</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[540px] mx-auto px-5 py-6 pb-28">
        <div key={activeView} className="view-enter">
          {activeView === "home" && <HomeView onNavigate={setActiveView} onAddItem={() => setShowAddItem(true)} onSelectRecipe={goToRecipe} />}
          {activeView === "pantry" && <PantryView onAddItem={() => setShowAddItem(true)} />}
          {activeView === "recipes" && <RecipesView onAddRecipe={() => setShowAddRecipe(true)} selectedRecipeId={selectedRecipeId} onSelectRecipe={setSelectedRecipeId} />}
          {activeView === "plan" && <PlanView onSelectRecipe={goToRecipe} />}
          {activeView === "grocery" && <GroceryView />}
        </div>
      </main>

      {/* Bottom Navigation - Floating Pill */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 px-3 py-2 rounded-2xl backdrop-blur-xl bg-[var(--surface-1)]/80 border border-[var(--border)]/60 shadow-lg shadow-black/10">
          <NavButton active={activeView === "home"} onClick={() => setActiveView("home")} icon={<Home size={20} />} label="Home" />
          <NavButton active={activeView === "pantry"} onClick={() => setActiveView("pantry")} icon={<Refrigerator size={20} />} label="Pantry" />
          <NavButton active={activeView === "recipes"} onClick={() => setActiveView("recipes")} icon={<BookOpen size={20} />} label="Recipes" />
          <NavButton active={activeView === "plan"} onClick={() => setActiveView("plan")} icon={<CalendarDays size={20} />} label="Plan" />
          <NavButton active={activeView === "grocery"} onClick={() => setActiveView("grocery")} icon={<ShoppingCart size={20} />} label="Shop" />
        </div>
      </nav>

      {/* Modals */}
      {showAddItem && <AddItemModal onClose={() => setShowAddItem(false)} />}
      {showAddRecipe && <AddRecipeModal onClose={() => setShowAddRecipe(false)} />}
    </div>
  );
}

// ============ NAV BUTTON ============
function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-300 ${
        active ? "text-[var(--primary)] bg-[var(--primary-wash)]" : "text-[var(--text-muted)]"
      }`}
    >
      <div className={`transition-transform duration-300 ${active ? "scale-110" : ""}`}>{icon}</div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

// ============ HOME VIEW (Dashboard) ============
function HomeView({ onNavigate, onAddItem, onSelectRecipe }: { onNavigate: (view: any) => void; onAddItem: () => void; onSelectRecipe: (id: string) => void }) {
  const pantryItems = useQuery(api.pantry.list);
  const expiring = useQuery(api.pantry.expiringSoon, { withinDays: 5 });
  const recipes = useQuery(api.recipes.canMake);
  const groceryItems = useQuery(api.groceryList.list);
  const todayPlan = useQuery(api.mealPlans.getByDate, { date: format(new Date(), "yyyy-MM-dd") });

  const uncheckedGrocery = groceryItems?.filter(i => !i.checked) || [];
  const readyToMake = recipes?.filter(r => r.canMake) || [];
  const almostReady = recipes?.filter(r => !r.canMake && r.missingCount <= 2) || [];

  if (pantryItems === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-3/4" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="pt-2">
        <h2 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">
          {getGreeting()}
        </h2>
        <p className="text-[15px] text-[var(--text-muted)] mt-1">Here's what's happening in your kitchen</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onAddItem} className="card-elevated flex items-center gap-3 !p-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--primary-wash)] text-[var(--primary)]">
            <Plus size={22} />
          </div>
          <div className="text-left">
            <div className="font-semibold text-[var(--text-primary)]">Add Item</div>
            <div className="text-sm text-[var(--text-secondary)]">to pantry</div>
          </div>
        </button>
        <button onClick={() => onNavigate("grocery")} className="card-elevated flex items-center gap-3 !p-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--accent-wash)] text-[var(--accent)]">
            <ShoppingCart size={22} />
          </div>
          <div className="text-left">
            <div className="font-semibold text-[var(--text-primary)]">Shopping</div>
            <div className="text-sm text-[var(--text-secondary)]">{uncheckedGrocery.length} items</div>
          </div>
        </button>
      </div>

      {/* Expiring Soon Alert */}
      {expiring && expiring.length > 0 && (
        <div className="card-accent !bg-[var(--primary-wash)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--primary)] text-[#0C0C0E]">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Use it soon!</h3>
              <p className="text-sm text-[var(--text-secondary)]">{expiring.length} item{expiring.length > 1 ? 's' : ''} expiring this week</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {expiring.slice(0, 4).map((item) => (
              <span key={item._id} className="bg-[var(--surface-2)] px-3 py-1.5 rounded-full text-sm font-medium text-[var(--primary)]">
                {item.name}
              </span>
            ))}
            {expiring.length > 4 && (
              <span className="px-3 py-1.5 text-sm text-[var(--text-muted)]">+{expiring.length - 4} more</span>
            )}
          </div>
        </div>
      )}

      {/* Tonight's Dinner */}
      {todayPlan && todayPlan.meals.length > 0 ? (
        <div className="card-surface">
          <h3 className="font-semibold text-[var(--text-primary)] mb-3">Tonight's Dinner</h3>
          <div className="space-y-2">
            {todayPlan.meals.map((meal, i) => (
              <MealCard key={i} meal={meal} recipes={recipes || []} />
            ))}
          </div>
        </div>
      ) : (
        <div className="card-surface !bg-[var(--primary-wash)]">
          <div className="text-center py-4">
            <p className="text-[var(--primary)] font-medium mb-3">No dinner planned yet</p>
            <button onClick={() => onNavigate("plan")} className="btn-primary">
              Plan Tonight's Meal
            </button>
          </div>
        </div>
      )}

      {/* What Can You Make */}
      <div className="card-surface">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[var(--text-primary)]">Ready to Cook</h3>
          <button onClick={() => onNavigate("recipes")} className="text-[var(--primary)] text-sm font-medium">See all</button>
        </div>

        {readyToMake.length > 0 ? (
          <div className="space-y-3">
            {readyToMake.slice(0, 3).map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} onClick={() => onSelectRecipe(recipe._id)} />
            ))}
          </div>
        ) : almostReady.length > 0 ? (
          <div>
            <p className="text-[var(--text-secondary)] text-sm mb-3">You're close! These need just 1-2 more ingredients:</p>
            <div className="space-y-3">
              {almostReady.slice(0, 2).map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} onClick={() => onSelectRecipe(recipe._id)} />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-[var(--text-muted)] text-center py-4">Add some recipes to get started!</p>
        )}
      </div>

      {/* Pantry Overview */}
      <div className="card-surface">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[var(--text-primary)]">Your Pantry</h3>
          <button onClick={() => onNavigate("pantry")} className="text-[var(--primary)] text-sm font-medium">View all</button>
        </div>
        <div className="grid grid-cols-4 gap-3 text-center">
          <PantryQuickStat label="Fridge" count={pantryItems?.filter(i => i.location === "fridge").length || 0} icon={<Refrigerator size={18} />} />
          <PantryQuickStat label="Freezer" count={pantryItems?.filter(i => i.location === "freezer").length || 0} icon={<Snowflake size={18} />} />
          <PantryQuickStat label="Pantry" count={pantryItems?.filter(i => i.location === "pantry").length || 0} icon={<Package size={18} />} />
          <PantryQuickStat label="Spices" count={pantryItems?.filter(i => i.location === "spices").length || 0} icon={<Flame size={18} />} />
        </div>
      </div>
    </div>
  );
}

function PantryQuickStat({ label, count, icon }: { label: string; count: number; icon: React.ReactNode }) {
  return (
    <div className="bg-[var(--surface-2)] rounded-xl p-3">
      <div className="text-[var(--text-muted)] mb-1 flex justify-center">{icon}</div>
      <div className="text-lg font-bold text-[var(--text-primary)]">{count}</div>
      <div className="text-[11px] uppercase tracking-wide font-semibold text-[var(--text-muted)]">{label}</div>
    </div>
  );
}

function MealCard({ meal, recipes }: { meal: any; recipes: any[] }) {
  const recipe = meal.recipeId ? recipes.find(r => r._id === meal.recipeId) : null;
  const name = recipe?.name || meal.customMeal || "Unknown";

  return (
    <div className="flex items-center gap-3 bg-[var(--surface-2)] rounded-xl p-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--secondary-wash)] text-[var(--secondary)]">
        <ChefHat size={18} />
      </div>
      <div className="flex-1">
        <div className="font-medium text-[var(--text-primary)]">{name}</div>
        {recipe && (
          <div className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
            {recipe.prepTime && recipe.cookTime && (
              <span className="flex items-center gap-1">
                <Clock size={14} /> {recipe.prepTime + recipe.cookTime}m
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RecipeCard({ recipe, onClick }: { recipe: any; onClick?: () => void }) {
  return (
    <div onClick={onClick} className="card-elevated !p-3 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        recipe.canMake
          ? "bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary)] text-white"
          : "bg-[var(--surface-3)] text-[var(--primary)]"
      }`}>
        {recipe.canMake ? <Check size={18} /> : <span className="text-sm font-bold">-{recipe.missingCount}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[var(--text-primary)]">{recipe.name}</div>
        <div className="text-sm text-[var(--text-secondary)] flex items-center gap-2 flex-wrap">
          {recipe.prepTime && recipe.cookTime && (
            <span className="flex items-center gap-1">
              <Clock size={14} /> {recipe.prepTime + recipe.cookTime}m
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Users size={14} /> {recipe.servings}
            </span>
          )}
          {recipe.tags?.slice(0, 2).map((tag: string) => (
            <span key={tag} className="bg-[var(--primary-wash)] text-[var(--primary)] px-2 py-0.5 rounded text-xs font-medium">{tag}</span>
          ))}
        </div>
      </div>
      {!recipe.canMake && recipe.missing?.length > 0 && (
        <div className="text-xs text-[var(--accent)] bg-[var(--accent-wash)] px-2 py-1 rounded-lg flex-shrink-0">
          Need: {recipe.missing.slice(0, 2).join(", ")}
        </div>
      )}
    </div>
  );
}

// ============ PANTRY VIEW ============
function PantryView({ onAddItem }: { onAddItem: () => void }) {
  const items = useQuery(api.pantry.list);
  const removeItem = useMutation(api.pantry.remove);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);

  const locations = [
    { id: "fridge", label: "Fridge", icon: <Refrigerator size={16} /> },
    { id: "freezer", label: "Freezer", icon: <Snowflake size={16} /> },
    { id: "pantry", label: "Pantry", icon: <Package size={16} /> },
    { id: "spices", label: "Spices", icon: <Flame size={16} /> },
  ];

  const filteredItems = activeLocation
    ? items?.filter(i => i.location === activeLocation)
    : items;

  const groupedItems = locations.map(loc => ({
    ...loc,
    items: (activeLocation ? filteredItems : items)?.filter(i => i.location === loc.id) || []
  })).filter(g => !activeLocation || g.id === activeLocation);

  if (items === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="flex gap-2">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-20" />)}
        </div>
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">Your Pantry</h2>
          <p className="text-[var(--text-secondary)]">{items?.length || 0} items total</p>
        </div>
        <button onClick={onAddItem} className="btn-primary">
          <Plus size={18} /> Add
        </button>
      </div>

      {/* Location Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveLocation(null)}
          className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all text-sm ${
            !activeLocation ? "bg-[var(--primary)] text-[#0C0C0E]" : "bg-[var(--surface-2)] text-[var(--text-secondary)]"
          }`}
        >
          All
        </button>
        {locations.map(loc => (
          <button
            key={loc.id}
            onClick={() => setActiveLocation(activeLocation === loc.id ? null : loc.id)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all text-sm flex items-center gap-1.5 ${
              activeLocation === loc.id ? "bg-[var(--primary)] text-[#0C0C0E]" : "bg-[var(--surface-2)] text-[var(--text-secondary)]"
            }`}
          >
            {loc.icon} {loc.label}
          </button>
        ))}
      </div>

      {/* Items by Location */}
      <div className="space-y-6">
        {groupedItems.map(group => group.items.length > 0 && (
          <div key={group.id}>
            {!activeLocation && (
              <h3 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <span className="text-[var(--text-muted)]">{group.icon}</span> {group.label}
              </h3>
            )}
            <div className="space-y-2">
              {group.items.map(item => (
                <PantryItem key={item._id} item={item} onRemove={() => removeItem({ id: item._id })} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="card-surface text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white">
            <ShoppingCart size={28} />
          </div>
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">Your pantry is empty</h3>
          <p className="text-[var(--text-secondary)] mb-4">Add items to track what you have at home</p>
          <button onClick={onAddItem} className="btn-primary">Add First Item</button>
        </div>
      )}
    </div>
  );
}

function PantryItem({ item, onRemove }: { item: any; onRemove: () => void }) {
  const isExpiringSoon = item.expiresAt && (item.expiresAt - Date.now()) < 5 * 24 * 60 * 60 * 1000;
  const isExpired = item.expiresAt && item.expiresAt < Date.now();

  return (
    <div className={`card-elevated !p-4 flex items-center gap-3 group ${
      isExpired
        ? "!border-l-[3px] !border-l-[var(--accent)] !bg-[var(--accent-wash)]"
        : isExpiringSoon
        ? "!border-l-[3px] !border-l-[var(--primary)] !bg-[var(--primary-wash)]"
        : ""
    }`}>
      <div className="flex-1">
        <div className="font-medium text-[var(--text-primary)]">{item.name}</div>
        <div className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
          {item.quantity && <span>{item.quantity}</span>}
          {item.expiresAt && (
            <span className={isExpired ? "text-[var(--accent)]" : isExpiringSoon ? "text-[var(--primary)]" : ""}>
              {isExpired ? "Expired!" : `Exp: ${format(new Date(item.expiresAt), "MMM d")}`}
            </span>
          )}
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-all opacity-0 group-hover:opacity-100">
        <Trash2 size={18} />
      </button>
    </div>
  );
}

// ============ RECIPES VIEW ============
function RecipesView({ onAddRecipe, selectedRecipeId, onSelectRecipe }: { onAddRecipe: () => void; selectedRecipeId: string | null; onSelectRecipe: (id: string | null) => void }) {
  const recipes = useQuery(api.recipes.canMake);
  const [sortBy, setSortBy] = useState<"name" | "time" | "ready">("ready");
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const recipe = recipes?.find(r => r._id === selectedRecipeId);

  const allTags = [...new Set(recipes?.flatMap(r => r.tags) || [])];

  const sortedRecipes = [...(recipes || [])].filter(r => !filterTag || r.tags.includes(filterTag)).sort((a, b) => {
    if (sortBy === "ready") return (a.canMake === b.canMake) ? 0 : a.canMake ? -1 : 1;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "time") return ((a.prepTime || 0) + (a.cookTime || 0)) - ((b.prepTime || 0) + (b.cookTime || 0));
    return 0;
  });

  if (recipe) {
    return <RecipeDetail recipe={recipe} onBack={() => onSelectRecipe(null)} />;
  }

  const readyCount = recipes?.filter(r => r.canMake).length || 0;

  if (recipes === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="flex gap-2">
          {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-24" />)}
        </div>
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">Recipes</h2>
          <p className="text-[var(--text-secondary)]">{readyCount} ready to cook</p>
        </div>
        <button onClick={onAddRecipe} className="btn-primary">
          <Plus size={18} /> Add
        </button>
      </div>

      {/* Sort & Filter */}
      <div className="flex flex-wrap gap-2">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="!w-auto !py-2 !px-3 text-sm"
        >
          <option value="ready">Sort: Ready first</option>
          <option value="name">Sort: A-Z</option>
          <option value="time">Sort: Quickest</option>
        </select>
        <button
          onClick={() => setFilterTag(null)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${!filterTag ? "bg-[var(--primary)] text-[#0C0C0E]" : "bg-[var(--surface-2)] text-[var(--text-secondary)]"}`}
        >
          All
        </button>
        {allTags.slice(0, 5).map(tag => (
          <button
            key={tag}
            onClick={() => setFilterTag(filterTag === tag ? null : tag)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filterTag === tag ? "bg-[var(--primary)] text-[#0C0C0E]" : "bg-[var(--surface-2)] text-[var(--text-secondary)]"}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Recipe List */}
      <div className="space-y-3">
        {sortedRecipes.map(r => (
          <RecipeCard key={r._id} recipe={r} onClick={() => onSelectRecipe(r._id)} />
        ))}
      </div>

      {recipes.length === 0 && (
        <div className="card-surface text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white">
            <BookOpen size={28} />
          </div>
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">No recipes yet</h3>
          <p className="text-[var(--text-secondary)] mb-4">Add your favorite recipes to get cooking suggestions</p>
          <button onClick={onAddRecipe} className="btn-primary">Add First Recipe</button>
        </div>
      )}
    </div>
  );
}

function RecipeDetail({ recipe, onBack }: { recipe: any; onBack: () => void }) {
  const addToGrocery = useMutation(api.groceryList.addFromRecipe);
  const deleteRecipe = useMutation(api.recipes.remove);
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = async () => {
    await deleteRecipe({ id: recipe._id });
    onBack();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="btn-ghost flex items-center gap-2">
          <ChevronLeft size={18} /> Back to recipes
        </button>
        <button onClick={() => setShowDelete(true)} className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
          <Trash2 size={18} />
        </button>
      </div>

      {showDelete && (
        <div className="card-accent !border-l-[var(--accent)]">
          <p className="text-[var(--text-primary)] mb-3">Delete "{recipe.name}"?</p>
          <div className="flex gap-2">
            <button onClick={handleDelete} className="btn-danger">Delete</button>
            <button onClick={() => setShowDelete(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      <div className="card-surface">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">{recipe.name}</h2>
            {recipe.source && <p className="text-[var(--text-secondary)]">{recipe.source}</p>}
          </div>
          {recipe.canMake && (
            <span className="bg-[var(--secondary-wash)] text-[var(--secondary)] px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Check size={14} /> Ready!
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-[var(--text-secondary)] mb-4 text-sm">
          {recipe.prepTime && (
            <span className="flex items-center gap-1">
              <Clock size={15} /> Prep: {recipe.prepTime}m
            </span>
          )}
          {recipe.prepTime && recipe.cookTime && <span className="text-[var(--text-muted)]">|</span>}
          {recipe.cookTime && (
            <span className="flex items-center gap-1">
              <Clock size={15} /> Cook: {recipe.cookTime}m
            </span>
          )}
          {(recipe.prepTime || recipe.cookTime) && recipe.servings && <span className="text-[var(--text-muted)]">|</span>}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Users size={15} /> {recipe.servings} servings
            </span>
          )}
        </div>

        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag: string) => (
              <span key={tag} className="bg-[var(--primary-wash)] text-[var(--primary)] px-3 py-1 rounded-full text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card-surface">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Ingredients</h3>
        <div className="space-y-2">
          {recipe.ingredients.map((ing: any, i: number) => {
            const have = !recipe.missing.includes(ing.name);
            return (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${have ? "bg-[var(--secondary-wash)]" : "bg-[var(--surface-2)]"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${have ? "bg-[var(--secondary)] text-white" : "border-2 border-[var(--text-muted)]"}`}>
                  {have && <Check size={14} />}
                </div>
                <span className={ing.optional ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}>
                  {ing.quantity} {ing.name}
                </span>
                {ing.optional && <span className="text-[var(--text-muted)] text-sm">(optional)</span>}
              </div>
            );
          })}
        </div>
        {!recipe.canMake && (
          <button
            onClick={() => addToGrocery({ recipeId: recipe._id })}
            className="btn-secondary w-full mt-4"
          >
            Add Missing to Shopping List
          </button>
        )}
      </div>

      <div className="card-surface">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Instructions</h3>
        <ol className="space-y-4">
          {recipe.instructions.map((step: string, i: number) => (
            <li key={i} className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-[var(--text-primary)] pt-1">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {recipe.notes && (
        <div className="card-accent !bg-[var(--primary-wash)]">
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">Notes</h3>
          <p className="text-[var(--text-secondary)]">{recipe.notes}</p>
        </div>
      )}
    </div>
  );
}

// ============ PLAN VIEW ============
function PlanView({ onSelectRecipe }: { onSelectRecipe: (id: string) => void }) {
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const weekPlans = useQuery(api.mealPlans.getWeek, {
    startDate: format(weekStart, "yyyy-MM-dd"),
    endDate: format(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
  });

  const recipes = useQuery(api.recipes.list);
  const setMeals = useMutation(api.mealPlans.setMeals);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showAddMeal, setShowAddMeal] = useState(false);

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
    return {
      date: format(date, "yyyy-MM-dd"),
      dayName: format(date, "EEE"),
      dayNum: format(date, "d"),
      monthName: format(date, "MMM"),
      isToday: format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"),
    };
  });

  const getMealsForDate = (date: string) => {
    return weekPlans?.find(p => p.date === date)?.meals || [];
  };

  const getRecipe = (recipeId: string) => {
    return recipes?.find(r => r._id === recipeId);
  };

  const removeMeal = async (date: string, index: number) => {
    const meals = getMealsForDate(date).filter((_, i) => i !== index);
    await setMeals({ date, meals: meals as any });
  };

  const addMealToDay = async (recipeId?: string, customMeal?: string) => {
    if (!selectedDay) return;
    const existingMeals = getMealsForDate(selectedDay);
    const newMeal = { type: "dinner", recipeId, customMeal };
    await setMeals({ date: selectedDay, meals: [...existingMeals, newMeal] as any });
    setShowAddMeal(false);
    setSelectedDay(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">Meal Plan</h2>
          <p className="text-[var(--text-secondary)]">{format(weekStart, "MMM d")} - {format(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000), "MMM d")}</p>
        </div>
        <button onClick={() => setShowComingSoon(true)} className="btn-primary opacity-70">
          <Sparkles size={18} /> AI Plan
        </button>
      </div>

      {showComingSoon && (
        <div className="card-accent !bg-gradient-to-r !from-[var(--primary-wash)] !to-[var(--accent-wash)] text-center">
          <div className="text-[var(--primary)] mb-2 flex justify-center">
            <Sparkles size={28} />
          </div>
          <h3 className="font-semibold text-[var(--text-primary)] mb-1">AI Meal Planning</h3>
          <p className="text-[var(--text-secondary)] text-sm mb-3">Coming soon! We're working on smart meal suggestions based on your pantry and preferences.</p>
          <button onClick={() => setShowComingSoon(false)} className="text-[var(--primary)] text-sm font-medium">Got it</button>
        </div>
      )}

      <div className="space-y-3">
        {days.map(day => {
          const meals = getMealsForDate(day.date);
          return (
            <div key={day.date} className={`card-surface !p-4 ${day.isToday ? "!border-[var(--primary)] !border-2 shadow-[0_0_20px_var(--primary-wash)]" : ""}`}>
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                  day.isToday
                    ? "bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white"
                    : "bg-[var(--surface-2)] text-[var(--text-muted)]"
                }`}>
                  <div className="text-[11px] uppercase tracking-wide font-semibold">{day.dayName}</div>
                  <div className="text-xl font-bold">{day.dayNum}</div>
                </div>
                <div className="flex-1">
                  {meals.length > 0 ? (
                    <div className="space-y-2">
                      {meals.map((meal, i) => {
                        const recipe = meal.recipeId ? getRecipe(meal.recipeId) : null;
                        return (
                          <div key={i} className="flex items-center gap-2 group">
                            <div
                              className={`flex-1 ${recipe ? "text-[var(--primary)] cursor-pointer hover:underline" : "text-[var(--text-primary)]"}`}
                              onClick={() => recipe && onSelectRecipe(recipe._id)}
                            >
                              {recipe?.name || meal.customMeal}
                            </div>
                            <button
                              onClick={() => removeMeal(day.date, i)}
                              className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[var(--text-muted)]">No meal planned</div>
                  )}
                  <button
                    onClick={() => { setSelectedDay(day.date); setShowAddMeal(true); }}
                    className="text-sm text-[var(--text-muted)] mt-2 hover:text-[var(--primary)] transition-colors"
                  >
                    + Add meal
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Meal Modal */}
      {showAddMeal && selectedDay && (
        <Modal onClose={() => { setShowAddMeal(false); setSelectedDay(null); }} title="Add Meal">
          <div className="space-y-4">
            <div>
              <label className="label">Pick a recipe</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recipes?.map(recipe => (
                  <button
                    key={recipe._id}
                    onClick={() => addMealToDay(recipe._id)}
                    className="w-full text-left p-3 bg-[var(--surface-2)] hover:bg-[var(--primary-wash)] rounded-xl transition-colors text-[var(--text-primary)]"
                  >
                    {recipe.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-[var(--border)] pt-4">
              <label className="label">Or add custom meal</label>
              <form onSubmit={(e) => {
                e.preventDefault();
                const input = (e.target as HTMLFormElement).elements.namedItem("custom") as HTMLInputElement;
                if (input.value.trim()) addMealToDay(undefined, input.value.trim());
              }}>
                <div className="flex gap-2">
                  <input name="custom" type="text" placeholder="e.g., Takeout Thai" className="flex-1" />
                  <button type="submit" className="btn-primary">Add</button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============ GROCERY VIEW ============
function GroceryView() {
  const items = useQuery(api.groceryList.list);
  const addItem = useMutation(api.groceryList.add);
  const toggleItem = useMutation(api.groceryList.toggle);
  const removeItem = useMutation(api.groceryList.remove);
  const clearChecked = useMutation(api.groceryList.clearChecked);
  const [newItem, setNewItem] = useState("");

  const unchecked = items?.filter(i => !i.checked) || [];
  const checked = items?.filter(i => i.checked) || [];

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await addItem({ name: newItem.trim() });
    setNewItem("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">Shopping List</h2>
        <p className="text-[var(--text-secondary)]">{unchecked.length} items to get</p>
      </div>

      {/* Add Item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add an item..."
          className="flex-1"
        />
        <button onClick={handleAdd} className="w-12 h-12 rounded-full bg-[var(--primary)] text-[#0C0C0E] flex items-center justify-center hover:shadow-lg hover:shadow-[var(--primary-wash)] transition-all">
          <Plus size={20} />
        </button>
      </div>

      {/* Unchecked Items */}
      {unchecked.length > 0 && (
        <div className="space-y-2">
          {unchecked.map(item => (
            <GroceryItem key={item._id} item={item} onToggle={() => toggleItem({ id: item._id })} onRemove={() => removeItem({ id: item._id })} />
          ))}
        </div>
      )}

      {/* Checked Items */}
      {checked.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-[var(--text-muted)]">Completed ({checked.length})</h3>
            <button onClick={() => clearChecked()} className="text-sm text-[var(--accent)]">Clear all</button>
          </div>
          <div className="space-y-2 opacity-40">
            {checked.map(item => (
              <GroceryItem key={item._id} item={item} onToggle={() => toggleItem({ id: item._id })} onRemove={() => removeItem({ id: item._id })} />
            ))}
          </div>
        </div>
      )}

      {(!items || items.length === 0) && (
        <div className="card-surface text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--secondary)] to-[var(--primary)] text-white">
            <Check size={28} />
          </div>
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">All done!</h3>
          <p className="text-[var(--text-secondary)]">Your shopping list is empty</p>
        </div>
      )}
    </div>
  );
}

function GroceryItem({ item, onToggle, onRemove }: { item: any; onToggle: () => void; onRemove: () => void }) {
  const [justChecked, setJustChecked] = useState(false);

  const handleToggle = () => {
    if (!item.checked) setJustChecked(true);
    onToggle();
  };

  return (
    <div className="card-elevated !p-4 flex items-center gap-3">
      <button
        onClick={handleToggle}
        className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
          item.checked
            ? `bg-[var(--secondary)] border-[var(--secondary)] text-white ${justChecked ? "check-bounce" : ""}`
            : "border-[var(--border)] hover:border-[var(--primary)]"
        }`}
      >
        {item.checked && <Check size={16} />}
      </button>
      <div className="flex-1">
        <span className={item.checked ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"}>{item.name}</span>
        {item.quantity && <span className="text-[var(--text-muted)] text-sm ml-2">({item.quantity})</span>}
      </div>
      <button onClick={onRemove} className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
        <Trash2 size={18} />
      </button>
    </div>
  );
}

// ============ MODALS ============
function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-sm"
        style={{ animation: "modalBackdropIn 0.2s ease-out" }}
        onClick={onClose}
      />
      <div
        className="relative bg-[var(--surface-1)] w-full max-w-md rounded-t-[20px] sm:rounded-[20px] p-6 max-h-[85vh] overflow-y-auto border border-[var(--border)]"
        style={{ animation: "modalSlideUp 0.3s ease-out" }}
      >
        {/* Drag handle on mobile */}
        <div className="sm:hidden flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-[var(--text-muted)]" />
        </div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{title}</h2>
          <button onClick={onClose} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)] rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddItemModal({ onClose }: { onClose: () => void }) {
  const addItem = useMutation(api.pantry.add);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("fridge");
  const [expiresIn, setExpiresIn] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const expiresAt = expiresIn ? Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000 : undefined;
    await addItem({ name: name.trim(), quantity: quantity || undefined, location, expiresAt });
    onClose();
  };

  const locationOptions = [
    { id: "fridge", label: "Fridge", icon: <Refrigerator size={20} /> },
    { id: "freezer", label: "Freezer", icon: <Snowflake size={20} /> },
    { id: "pantry", label: "Pantry", icon: <Package size={20} /> },
    { id: "spices", label: "Spices", icon: <Flame size={20} /> },
  ];

  return (
    <Modal onClose={onClose} title="Add to Pantry">
      <div className="space-y-4">
        <div>
          <label className="label">Item name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Chicken breast" autoFocus />
        </div>
        <div>
          <label className="label">Quantity (optional)</label>
          <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g., 1 lb" />
        </div>
        <div>
          <label className="label">Location</label>
          <div className="grid grid-cols-4 gap-2">
            {locationOptions.map(loc => (
              <button
                key={loc.id}
                onClick={() => setLocation(loc.id)}
                className={`p-3 rounded-xl text-center transition-all ${
                  location === loc.id
                    ? "bg-[var(--primary)] text-[#0C0C0E]"
                    : "bg-[var(--surface-2)] text-[var(--text-secondary)]"
                }`}
              >
                <div className="flex justify-center mb-1">{loc.icon}</div>
                <div className="text-xs font-medium">{loc.label}</div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Expires in (days)</label>
          <input type="number" value={expiresIn} onChange={(e) => setExpiresIn(e.target.value)} placeholder="e.g., 7" />
        </div>
        <button onClick={handleSubmit} className="btn-primary w-full">Add Item</button>
      </div>
    </Modal>
  );
}

function AddRecipeModal({ onClose }: { onClose: () => void }) {
  const addRecipe = useMutation(api.recipes.add);
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const parsedIngredients = ingredients.split("\n").filter((l: string) => l.trim()).map((line: string) => {
      const match = line.trim().match(/^([\d\/\s\w]+?)\s+(.+)$/);
      return match ? { name: match[2], quantity: match[1] } : { name: line.trim(), quantity: "" };
    });
    await addRecipe({
      name: name.trim(),
      tags: [],
      ingredients: parsedIngredients,
      instructions: instructions.split("\n\n").filter((s: string) => s.trim()),
    });
    onClose();
  };

  return (
    <Modal onClose={onClose} title="Add Recipe">
      <div className="space-y-4">
        <div>
          <label className="label">Recipe name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Chicken Stir-Fry" autoFocus />
        </div>
        <div>
          <label className="label">Ingredients (one per line)</label>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder={"1 lb chicken breast\n2 cups broccoli\n3 tbsp soy sauce"}
            rows={5}
          />
        </div>
        <div>
          <label className="label">Instructions (separate steps with blank line)</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder={"Mix the sauce ingredients.\n\nCook the chicken until golden.\n\nAdd vegetables and stir-fry."}
            rows={5}
          />
        </div>
        <button onClick={handleSubmit} className="btn-primary w-full">Add Recipe</button>
      </div>
    </Modal>
  );
}

// ============ HELPERS ============
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
