"use client";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { format, formatDistanceToNow } from "date-fns";

// ============ ICONS (Simple, Friendly) ============
const Icons = {
  home: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  fridge: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm0 8h14M9 3v8m0 0v10" /></svg>,
  book: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  calendar: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  cart: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  plus: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
  warning: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  sparkle: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  x: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  chef: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4c1.7 0 3.2.8 4.2 2 2.3.3 4.1 2.3 4.1 4.7 0 2.3-1.6 4.2-3.8 4.6-.1 1-.5 2-1 2.9-.7 1.1-1.8 1.8-3 1.8h-1c-1.2 0-2.3-.7-3-1.8-.5-.9-.9-1.9-1-2.9-2.2-.4-3.8-2.3-3.8-4.6 0-2.4 1.8-4.4 4.1-4.7 1-1.2 2.5-2 4.2-2z" /></svg>,
  clock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  trash: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  chevronRight: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
};

// ============ MAIN APP ============
export default function App() {
  const [activeView, setActiveView] = useState<"home" | "pantry" | "recipes" | "plan" | "grocery">("home");
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddRecipe, setShowAddRecipe] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#7C9A82] rounded-xl flex items-center justify-center">
                <Icons.chef />
              </div>
              <h1 className="text-xl font-bold text-[#2D3436]">Kitchen</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
        {activeView === "home" && <HomeView onNavigate={setActiveView} onAddItem={() => setShowAddItem(true)} />}
        {activeView === "pantry" && <PantryView onAddItem={() => setShowAddItem(true)} />}
        {activeView === "recipes" && <RecipesView onAddRecipe={() => setShowAddRecipe(true)} />}
        {activeView === "plan" && <PlanView />}
        {activeView === "grocery" && <GroceryView />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-around py-2">
            <NavButton active={activeView === "home"} onClick={() => setActiveView("home")} icon={<Icons.home />} label="Home" />
            <NavButton active={activeView === "pantry"} onClick={() => setActiveView("pantry")} icon={<Icons.fridge />} label="Pantry" />
            <NavButton active={activeView === "recipes"} onClick={() => setActiveView("recipes")} icon={<Icons.book />} label="Recipes" />
            <NavButton active={activeView === "plan"} onClick={() => setActiveView("plan")} icon={<Icons.calendar />} label="Plan" />
            <NavButton active={activeView === "grocery"} onClick={() => setActiveView("grocery")} icon={<Icons.cart />} label="Shop" />
          </div>
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
      className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
        active ? "text-[#7C9A82]" : "text-[#636E72]"
      }`}
    >
      <div className={`${active ? "scale-110" : ""} transition-transform`}>{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

// ============ HOME VIEW (Dashboard) ============
function HomeView({ onNavigate, onAddItem }: { onNavigate: (view: any) => void; onAddItem: () => void }) {
  const pantryItems = useQuery(api.pantry.list);
  const expiring = useQuery(api.pantry.expiringSoon, { withinDays: 5 });
  const recipes = useQuery(api.recipes.canMake);
  const groceryItems = useQuery(api.groceryList.list);
  const todayPlan = useQuery(api.mealPlans.getByDate, { date: format(new Date(), "yyyy-MM-dd") });

  const uncheckedGrocery = groceryItems?.filter(i => !i.checked) || [];
  const readyToMake = recipes?.filter(r => r.canMake) || [];
  const almostReady = recipes?.filter(r => !r.canMake && r.missingCount <= 2) || [];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="pt-2">
        <h2 className="text-2xl font-bold text-[#2D3436]">
          {getGreeting()} 👋
        </h2>
        <p className="text-[#636E72] mt-1">Here's what's happening in your kitchen</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onAddItem} className="card card-interactive flex items-center gap-3 !p-4">
          <div className="w-12 h-12 bg-[#E8F0E9] rounded-xl flex items-center justify-center text-[#7C9A82]">
            <Icons.plus />
          </div>
          <div className="text-left">
            <div className="font-semibold text-[#2D3436]">Add Item</div>
            <div className="text-sm text-[#636E72]">to pantry</div>
          </div>
        </button>
        <button onClick={() => onNavigate("grocery")} className="card card-interactive flex items-center gap-3 !p-4">
          <div className="w-12 h-12 bg-[#F5E6E0] rounded-xl flex items-center justify-center text-[#C17B5E]">
            <Icons.cart />
          </div>
          <div className="text-left">
            <div className="font-semibold text-[#2D3436]">Shopping</div>
            <div className="text-sm text-[#636E72]">{uncheckedGrocery.length} items</div>
          </div>
        </button>
      </div>

      {/* Expiring Soon Alert */}
      {expiring && expiring.length > 0 && (
        <div className="card !bg-[#FFF5F0] !border-[#FFDDD2]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#E17055] rounded-xl flex items-center justify-center text-white">
              <Icons.warning />
            </div>
            <div>
              <h3 className="font-semibold text-[#2D3436]">Use it soon!</h3>
              <p className="text-sm text-[#636E72]">{expiring.length} item{expiring.length > 1 ? 's' : ''} expiring this week</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {expiring.slice(0, 4).map((item) => (
              <span key={item._id} className="bg-white px-3 py-1.5 rounded-full text-sm font-medium text-[#E17055]">
                {item.name}
              </span>
            ))}
            {expiring.length > 4 && (
              <span className="px-3 py-1.5 text-sm text-[#636E72]">+{expiring.length - 4} more</span>
            )}
          </div>
        </div>
      )}

      {/* Tonight's Dinner */}
      {todayPlan && todayPlan.meals.length > 0 ? (
        <div className="card">
          <h3 className="font-semibold text-[#2D3436] mb-3">Tonight's Dinner 🍽️</h3>
          <div className="space-y-2">
            {todayPlan.meals.map((meal, i) => (
              <MealCard key={i} meal={meal} recipes={recipes || []} />
            ))}
          </div>
        </div>
      ) : (
        <div className="card !bg-[#E8F0E9]">
          <div className="text-center py-4">
            <p className="text-[#7C9A82] font-medium mb-2">No dinner planned yet</p>
            <button onClick={() => onNavigate("plan")} className="btn-primary !py-3 !px-6">
              Plan Tonight's Meal
            </button>
          </div>
        </div>
      )}

      {/* What Can You Make */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#2D3436]">Ready to Cook 🍳</h3>
          <button onClick={() => onNavigate("recipes")} className="text-[#7C9A82] text-sm font-medium">See all</button>
        </div>
        
        {readyToMake.length > 0 ? (
          <div className="space-y-3">
            {readyToMake.slice(0, 3).map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        ) : almostReady.length > 0 ? (
          <div>
            <p className="text-[#636E72] text-sm mb-3">You're close! These need just 1-2 more ingredients:</p>
            <div className="space-y-3">
              {almostReady.slice(0, 2).map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-[#636E72] text-center py-4">Add some recipes to get started!</p>
        )}
      </div>

      {/* Pantry Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#2D3436]">Your Pantry</h3>
          <button onClick={() => onNavigate("pantry")} className="text-[#7C9A82] text-sm font-medium">View all</button>
        </div>
        <div className="grid grid-cols-4 gap-3 text-center">
          <PantryQuickStat label="Fridge" count={pantryItems?.filter(i => i.location === "fridge").length || 0} emoji="🥬" />
          <PantryQuickStat label="Freezer" count={pantryItems?.filter(i => i.location === "freezer").length || 0} emoji="🧊" />
          <PantryQuickStat label="Pantry" count={pantryItems?.filter(i => i.location === "pantry").length || 0} emoji="🥫" />
          <PantryQuickStat label="Spices" count={pantryItems?.filter(i => i.location === "spices").length || 0} emoji="🌶️" />
        </div>
      </div>
    </div>
  );
}

function PantryQuickStat({ label, count, emoji }: { label: string; count: number; emoji: string }) {
  return (
    <div className="bg-[#F8F9FA] rounded-xl p-3">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-lg font-bold text-[#2D3436]">{count}</div>
      <div className="text-xs text-[#636E72]">{label}</div>
    </div>
  );
}

function MealCard({ meal, recipes }: { meal: any; recipes: any[] }) {
  const recipe = meal.recipeId ? recipes.find(r => r._id === meal.recipeId) : null;
  const name = recipe?.name || meal.customMeal || "Unknown";
  
  return (
    <div className="flex items-center gap-3 bg-[#F8F9FA] rounded-xl p-3">
      <div className="w-10 h-10 bg-[#7C9A82] rounded-xl flex items-center justify-center text-white">
        <Icons.chef />
      </div>
      <div className="flex-1">
        <div className="font-medium text-[#2D3436]">{name}</div>
        {recipe && (
          <div className="text-sm text-[#636E72] flex items-center gap-2">
            {recipe.prepTime && recipe.cookTime && (
              <span className="flex items-center gap-1">
                <Icons.clock /> {recipe.prepTime + recipe.cookTime}m
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: any }) {
  return (
    <div className="flex items-center gap-3 bg-[#F8F9FA] rounded-xl p-3 cursor-pointer hover:bg-[#F0F1F2] transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${recipe.canMake ? "bg-[#7C9A82] text-white" : "bg-[#E5E5E5] text-[#636E72]"}`}>
        {recipe.canMake ? <Icons.check /> : <span className="text-sm font-bold">-{recipe.missingCount}</span>}
      </div>
      <div className="flex-1">
        <div className="font-medium text-[#2D3436]">{recipe.name}</div>
        <div className="text-sm text-[#636E72] flex items-center gap-2">
          {recipe.prepTime && recipe.cookTime && (
            <span className="flex items-center gap-1">
              <Icons.clock /> {recipe.prepTime + recipe.cookTime}m
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Icons.users /> {recipe.servings}
            </span>
          )}
        </div>
      </div>
      {!recipe.canMake && recipe.missing.length > 0 && (
        <div className="text-xs text-[#C17B5E] bg-[#F5E6E0] px-2 py-1 rounded-lg">
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
    { id: "fridge", label: "Fridge", emoji: "🥬" },
    { id: "freezer", label: "Freezer", emoji: "🧊" },
    { id: "pantry", label: "Pantry", emoji: "🥫" },
    { id: "spices", label: "Spices", emoji: "🌶️" },
  ];

  const filteredItems = activeLocation 
    ? items?.filter(i => i.location === activeLocation)
    : items;

  const groupedItems = locations.map(loc => ({
    ...loc,
    items: (activeLocation ? filteredItems : items)?.filter(i => i.location === loc.id) || []
  })).filter(g => !activeLocation || g.id === activeLocation);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2D3436]">Your Pantry</h2>
          <p className="text-[#636E72]">{items?.length || 0} items total</p>
        </div>
        <button onClick={onAddItem} className="btn-primary !py-3 !px-4">
          <Icons.plus /> Add
        </button>
      </div>

      {/* Location Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveLocation(null)}
          className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
            !activeLocation ? "bg-[#7C9A82] text-white" : "bg-white text-[#636E72]"
          }`}
        >
          All
        </button>
        {locations.map(loc => (
          <button
            key={loc.id}
            onClick={() => setActiveLocation(activeLocation === loc.id ? null : loc.id)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              activeLocation === loc.id ? "bg-[#7C9A82] text-white" : "bg-white text-[#636E72]"
            }`}
          >
            {loc.emoji} {loc.label}
          </button>
        ))}
      </div>

      {/* Items by Location */}
      <div className="space-y-6">
        {groupedItems.map(group => group.items.length > 0 && (
          <div key={group.id}>
            {!activeLocation && (
              <h3 className="font-semibold text-[#2D3436] mb-3 flex items-center gap-2">
                <span className="text-xl">{group.emoji}</span> {group.label}
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

      {(!items || items.length === 0) && (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">🛒</div>
          <h3 className="font-semibold text-[#2D3436] mb-2">Your pantry is empty</h3>
          <p className="text-[#636E72] mb-4">Add items to track what you have at home</p>
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
    <div className={`card !p-4 flex items-center gap-3 ${isExpired ? "!bg-[#FFF0F0] !border-[#FFD0D0]" : isExpiringSoon ? "!bg-[#FFF8F0] !border-[#FFE4CC]" : ""}`}>
      <div className="flex-1">
        <div className="font-medium text-[#2D3436]">{item.name}</div>
        <div className="text-sm text-[#636E72] flex items-center gap-2">
          {item.quantity && <span>{item.quantity}</span>}
          {item.expiresAt && (
            <span className={isExpired ? "text-[#E17055]" : isExpiringSoon ? "text-[#E17055]" : ""}>
              {isExpired ? "Expired!" : `Exp: ${format(new Date(item.expiresAt), "MMM d")}`}
            </span>
          )}
        </div>
      </div>
      <button onClick={onRemove} className="p-2 text-[#B2BEC3] hover:text-[#E17055] transition-colors">
        <Icons.trash />
      </button>
    </div>
  );
}

// ============ RECIPES VIEW ============
function RecipesView({ onAddRecipe }: { onAddRecipe: () => void }) {
  const recipes = useQuery(api.recipes.canMake);
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);

  const recipe = recipes?.find(r => r._id === selectedRecipe);

  if (recipe) {
    return <RecipeDetail recipe={recipe} onBack={() => setSelectedRecipe(null)} />;
  }

  const readyToMake = recipes?.filter(r => r.canMake) || [];
  const needsShopping = recipes?.filter(r => !r.canMake) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2D3436]">Recipes</h2>
          <p className="text-[#636E72]">{readyToMake.length} ready to cook</p>
        </div>
        <button onClick={onAddRecipe} className="btn-primary !py-3 !px-4">
          <Icons.plus /> Add
        </button>
      </div>

      {readyToMake.length > 0 && (
        <div>
          <h3 className="font-semibold text-[#7C9A82] mb-3 flex items-center gap-2">
            <Icons.check /> Ready to Make
          </h3>
          <div className="space-y-3">
            {readyToMake.map(r => (
              <div key={r._id} onClick={() => setSelectedRecipe(r._id)} className="cursor-pointer">
                <RecipeCard recipe={r} />
              </div>
            ))}
          </div>
        </div>
      )}

      {needsShopping.length > 0 && (
        <div>
          <h3 className="font-semibold text-[#636E72] mb-3">Need Ingredients</h3>
          <div className="space-y-3">
            {needsShopping.map(r => (
              <div key={r._id} onClick={() => setSelectedRecipe(r._id)} className="cursor-pointer">
                <RecipeCard recipe={r} />
              </div>
            ))}
          </div>
        </div>
      )}

      {(!recipes || recipes.length === 0) && (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">📖</div>
          <h3 className="font-semibold text-[#2D3436] mb-2">No recipes yet</h3>
          <p className="text-[#636E72] mb-4">Add your favorite recipes to get cooking suggestions</p>
          <button onClick={onAddRecipe} className="btn-primary">Add First Recipe</button>
        </div>
      )}
    </div>
  );
}

function RecipeDetail({ recipe, onBack }: { recipe: any; onBack: () => void }) {
  const addToGrocery = useMutation(api.groceryList.addFromRecipe);

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-[#636E72] hover:text-[#2D3436] transition-colors">
        <Icons.chevronRight /> Back to recipes
      </button>

      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#2D3436]">{recipe.name}</h2>
            {recipe.source && <p className="text-[#636E72]">{recipe.source}</p>}
          </div>
          {recipe.canMake && (
            <span className="bg-[#E8F0E9] text-[#7C9A82] px-3 py-1 rounded-full text-sm font-medium">
              Ready! ✓
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-[#636E72] mb-4">
          {recipe.prepTime && (
            <span className="flex items-center gap-1">
              <Icons.clock /> Prep: {recipe.prepTime}m
            </span>
          )}
          {recipe.cookTime && (
            <span className="flex items-center gap-1">
              <Icons.clock /> Cook: {recipe.cookTime}m
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Icons.users /> {recipe.servings} servings
            </span>
          )}
        </div>

        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.tags.map((tag: string) => (
              <span key={tag} className="bg-[#F8F9FA] text-[#636E72] px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold text-[#2D3436] mb-4">Ingredients</h3>
        <div className="space-y-2">
          {recipe.ingredients.map((ing: any, i: number) => {
            const have = !recipe.missing.includes(ing.name);
            return (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${have ? "bg-[#E8F0E9]" : "bg-[#F8F9FA]"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${have ? "bg-[#7C9A82] text-white" : "border-2 border-[#B2BEC3]"}`}>
                  {have && <Icons.check />}
                </div>
                <span className={ing.optional ? "text-[#636E72]" : "text-[#2D3436]"}>
                  {ing.quantity} {ing.name}
                </span>
                {ing.optional && <span className="text-[#B2BEC3] text-sm">(optional)</span>}
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

      <div className="card">
        <h3 className="font-semibold text-[#2D3436] mb-4">Instructions</h3>
        <ol className="space-y-4">
          {recipe.instructions.map((step: string, i: number) => (
            <li key={i} className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-[#7C9A82] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-[#2D3436] pt-1">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {recipe.notes && (
        <div className="card !bg-[#FFF8F0]">
          <h3 className="font-semibold text-[#2D3436] mb-2">Notes</h3>
          <p className="text-[#636E72]">{recipe.notes}</p>
        </div>
      )}
    </div>
  );
}

// ============ PLAN VIEW ============
function PlanView() {
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
  const [generating, setGenerating] = useState(false);

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

  const getRecipeName = (recipeId: string) => {
    return recipes?.find(r => r._id === recipeId)?.name || "Unknown";
  };

  const generatePlan = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/plan-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pantryItems: [],
          recipes: recipes || [],
          startDate: format(weekStart, "yyyy-MM-dd"),
          preferences: "Prefer variety, quick weeknight meals",
        }),
      });
      const data = await res.json();
      if (data.plan) {
        for (const day of data.plan) {
          const meal = {
            type: "dinner" as const,
            recipeId: day.recipeId || undefined,
            customMeal: !day.recipeId ? day.meal : undefined,
          };
          await setMeals({ date: day.date, meals: [meal] });
        }
      }
    } catch (err) {
      console.error("Failed to generate plan:", err);
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2D3436]">Meal Plan</h2>
          <p className="text-[#636E72]">{format(weekStart, "MMM d")} - {format(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000), "MMM d")}</p>
        </div>
        <button onClick={generatePlan} disabled={generating} className="btn-primary !py-3 !px-4">
          {generating ? "Planning..." : <><Icons.sparkle /> Plan Week</>}
        </button>
      </div>

      <div className="space-y-3">
        {days.map(day => {
          const meals = getMealsForDate(day.date);
          return (
            <div key={day.date} className={`card !p-4 ${day.isToday ? "!border-[#7C9A82] !border-2" : ""}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${day.isToday ? "bg-[#7C9A82] text-white" : "bg-[#F8F9FA]"}`}>
                  <div className="text-xs font-medium">{day.dayName}</div>
                  <div className="text-xl font-bold">{day.dayNum}</div>
                </div>
                <div className="flex-1">
                  {meals.length > 0 ? (
                    <div>
                      {meals.map((meal, i) => (
                        <div key={i} className="font-medium text-[#2D3436]">
                          {meal.recipeId ? getRecipeName(meal.recipeId) : meal.customMeal}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[#B2BEC3]">No meal planned</div>
                  )}
                </div>
                <Icons.chevronRight />
              </div>
            </div>
          );
        })}
      </div>
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
        <h2 className="text-2xl font-bold text-[#2D3436]">Shopping List</h2>
        <p className="text-[#636E72]">{unchecked.length} items to get</p>
      </div>

      {/* Add Item */}
      <div className="card !p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Add an item..."
            className="flex-1 !py-3"
          />
          <button onClick={handleAdd} className="btn-primary !py-3 !px-4">
            <Icons.plus />
          </button>
        </div>
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
            <h3 className="font-medium text-[#636E72]">Completed ({checked.length})</h3>
            <button onClick={() => clearChecked()} className="text-sm text-[#C17B5E]">Clear all</button>
          </div>
          <div className="space-y-2 opacity-60">
            {checked.map(item => (
              <GroceryItem key={item._id} item={item} onToggle={() => toggleItem({ id: item._id })} onRemove={() => removeItem({ id: item._id })} />
            ))}
          </div>
        </div>
      )}

      {(!items || items.length === 0) && (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">✓</div>
          <h3 className="font-semibold text-[#2D3436] mb-2">All done!</h3>
          <p className="text-[#636E72]">Your shopping list is empty</p>
        </div>
      )}
    </div>
  );
}

function GroceryItem({ item, onToggle, onRemove }: { item: any; onToggle: () => void; onRemove: () => void }) {
  return (
    <div className="card !p-4 flex items-center gap-3">
      <button onClick={onToggle} className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${item.checked ? "bg-[#7C9A82] border-[#7C9A82] text-white" : "border-[#B2BEC3]"}`}>
        {item.checked && <Icons.check />}
      </button>
      <div className="flex-1">
        <span className={item.checked ? "line-through text-[#B2BEC3]" : "text-[#2D3436]"}>{item.name}</span>
        {item.quantity && <span className="text-[#636E72] text-sm ml-2">({item.quantity})</span>}
      </div>
      <button onClick={onRemove} className="p-2 text-[#B2BEC3] hover:text-[#E17055] transition-colors">
        <Icons.trash />
      </button>
    </div>
  );
}

// ============ MODALS ============
function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#2D3436]">{title}</h2>
          <button onClick={onClose} className="p-2 text-[#636E72] hover:text-[#2D3436] transition-colors">
            <Icons.x />
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

  return (
    <Modal onClose={onClose} title="Add to Pantry">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#636E72] mb-2">Item name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Chicken breast" autoFocus />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#636E72] mb-2">Quantity (optional)</label>
          <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g., 1 lb" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#636E72] mb-2">Location</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "fridge", label: "Fridge", emoji: "🥬" },
              { id: "freezer", label: "Freezer", emoji: "🧊" },
              { id: "pantry", label: "Pantry", emoji: "🥫" },
              { id: "spices", label: "Spices", emoji: "🌶️" },
            ].map(loc => (
              <button
                key={loc.id}
                onClick={() => setLocation(loc.id)}
                className={`p-3 rounded-xl text-center transition-all ${location === loc.id ? "bg-[#7C9A82] text-white" : "bg-[#F8F9FA]"}`}
              >
                <div className="text-xl">{loc.emoji}</div>
                <div className="text-xs mt-1">{loc.label}</div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#636E72] mb-2">Expires in (days)</label>
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
          <label className="block text-sm font-medium text-[#636E72] mb-2">Recipe name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Chicken Stir-Fry" autoFocus />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#636E72] mb-2">Ingredients (one per line)</label>
          <textarea 
            value={ingredients} 
            onChange={(e) => setIngredients(e.target.value)} 
            placeholder={"1 lb chicken breast\n2 cups broccoli\n3 tbsp soy sauce"}
            rows={5}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#636E72] mb-2">Instructions (separate steps with blank line)</label>
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
