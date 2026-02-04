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
  edit: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
};

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
    <div className="min-h-screen bg-[#FDF8F3]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#7C9A82] rounded-xl flex items-center justify-center text-white">
                <Icons.chef />
              </div>
              <h1 className="text-xl font-bold text-[#2D3436]">Kitchen</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
        {activeView === "home" && <HomeView onNavigate={setActiveView} onAddItem={() => setShowAddItem(true)} onSelectRecipe={goToRecipe} />}
        {activeView === "pantry" && <PantryView onAddItem={() => setShowAddItem(true)} />}
        {activeView === "recipes" && <RecipesView onAddRecipe={() => setShowAddRecipe(true)} selectedRecipeId={selectedRecipeId} onSelectRecipe={setSelectedRecipeId} />}
        {activeView === "plan" && <PlanView onSelectRecipe={goToRecipe} />}
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
function HomeView({ onNavigate, onAddItem, onSelectRecipe }: { onNavigate: (view: any) => void; onAddItem: () => void; onSelectRecipe: (id: string) => void }) {
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
              <RecipeCard key={recipe._id} recipe={recipe} onClick={() => onSelectRecipe(recipe._id)} />
            ))}
          </div>
        ) : almostReady.length > 0 ? (
          <div>
            <p className="text-[#636E72] text-sm mb-3">You're close! These need just 1-2 more ingredients:</p>
            <div className="space-y-3">
              {almostReady.slice(0, 2).map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} onClick={() => onSelectRecipe(recipe._id)} />
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

function RecipeCard({ recipe, onClick }: { recipe: any; onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center gap-3 bg-[#F8F9FA] rounded-xl p-3 cursor-pointer hover:bg-[#F0F1F2] transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${recipe.canMake ? "bg-[#7C9A82] text-white" : "bg-[#E5E5E5] text-[#636E72]"}`}>
        {recipe.canMake ? <Icons.check /> : <span className="text-sm font-bold">-{recipe.missingCount}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[#2D3436]">{recipe.name}</div>
        <div className="text-sm text-[#636E72] flex items-center gap-2 flex-wrap">
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
          {recipe.tags?.slice(0, 2).map((tag: string) => (
            <span key={tag} className="bg-[#E8F0E9] text-[#7C9A82] px-2 py-0.5 rounded text-xs">{tag}</span>
          ))}
        </div>
      </div>
      {!recipe.canMake && recipe.missing?.length > 0 && (
        <div className="text-xs text-[#C17B5E] bg-[#F5E6E0] px-2 py-1 rounded-lg flex-shrink-0">
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
  const [editingItem, setEditingItem] = useState<any | null>(null);

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
                <PantryItem key={item._id} item={item} onRemove={() => removeItem({ id: item._id })} onEdit={() => setEditingItem(item)} />
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

      {/* Edit Modal */}
      {editingItem && <EditItemModal item={editingItem} onClose={() => setEditingItem(null)} />}
    </div>
  );
}

function PantryItem({ item, onRemove, onEdit }: { item: any; onRemove: () => void; onEdit: () => void }) {
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
      <button onClick={onEdit} className="p-2 text-[#B2BEC3] hover:text-[#7C9A82] transition-colors">
        <Icons.edit />
      </button>
      <button onClick={onRemove} className="p-2 text-[#B2BEC3] hover:text-[#E17055] transition-colors">
        <Icons.trash />
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2D3436]">Recipes</h2>
          <p className="text-[#636E72]">{readyCount} ready to cook</p>
        </div>
        <button onClick={onAddRecipe} className="btn-primary !py-3 !px-4">
          <Icons.plus /> Add
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
          className={`px-3 py-2 rounded-lg text-sm font-medium ${!filterTag ? "bg-[#7C9A82] text-white" : "bg-white text-[#636E72]"}`}
        >
          All
        </button>
        {allTags.slice(0, 5).map(tag => (
          <button 
            key={tag}
            onClick={() => setFilterTag(filterTag === tag ? null : tag)} 
            className={`px-3 py-2 rounded-lg text-sm font-medium ${filterTag === tag ? "bg-[#7C9A82] text-white" : "bg-white text-[#636E72]"}`}
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
  const deleteRecipe = useMutation(api.recipes.remove);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const handleDelete = async () => {
    await deleteRecipe({ id: recipe._id });
    onBack();
  };

  if (showEdit) {
    return <EditRecipeForm recipe={recipe} onBack={() => setShowEdit(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-[#636E72] hover:text-[#2D3436] transition-colors">
          <div className="rotate-180"><Icons.chevronRight /></div> Back to recipes
        </button>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowEdit(true)} className="p-2 text-[#B2BEC3] hover:text-[#7C9A82] transition-colors">
            <Icons.edit />
          </button>
          <button onClick={() => setShowDelete(true)} className="p-2 text-[#B2BEC3] hover:text-[#E17055] transition-colors">
            <Icons.trash />
          </button>
        </div>
      </div>

      {showDelete && (
        <div className="card !bg-[#FFF0F0] !border-[#FFD0D0]">
          <p className="text-[#2D3436] mb-3">Delete "{recipe.name}"?</p>
          <div className="flex gap-2">
            <button onClick={handleDelete} className="btn-secondary !bg-[#E17055] !py-2 !px-4">Delete</button>
            <button onClick={() => setShowDelete(false)} className="btn-ghost !py-2 !px-4">Cancel</button>
          </div>
        </div>
      )}

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
          <h2 className="text-2xl font-bold text-[#2D3436]">Meal Plan</h2>
          <p className="text-[#636E72]">{format(weekStart, "MMM d")} - {format(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000), "MMM d")}</p>
        </div>
        <button onClick={() => setShowComingSoon(true)} className="btn-primary !py-3 !px-4 opacity-70">
          <Icons.sparkle /> AI Plan
        </button>
      </div>

      {showComingSoon && (
        <div className="card !bg-[#E8F0E9] text-center">
          <div className="text-2xl mb-2">✨</div>
          <h3 className="font-semibold text-[#2D3436] mb-1">AI Meal Planning</h3>
          <p className="text-[#636E72] text-sm mb-3">Coming soon! We're working on smart meal suggestions based on your pantry and preferences.</p>
          <button onClick={() => setShowComingSoon(false)} className="text-[#7C9A82] text-sm font-medium">Got it</button>
        </div>
      )}

      <div className="space-y-3">
        {days.map(day => {
          const meals = getMealsForDate(day.date);
          return (
            <div key={day.date} className={`card !p-4 ${day.isToday ? "!border-[#7C9A82] !border-2" : ""}`}>
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${day.isToday ? "bg-[#7C9A82] text-white" : "bg-[#F8F9FA]"}`}>
                  <div className="text-xs font-medium">{day.dayName}</div>
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
                              className={`flex-1 ${recipe ? "text-[#7C9A82] cursor-pointer hover:underline" : "text-[#2D3436]"}`}
                              onClick={() => recipe && onSelectRecipe(recipe._id)}
                            >
                              {recipe?.name || meal.customMeal}
                            </div>
                            <button 
                              onClick={() => removeMeal(day.date, i)}
                              className="p-1 text-[#B2BEC3] hover:text-[#E17055] opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Icons.x />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[#B2BEC3]">No meal planned</div>
                  )}
                  <button 
                    onClick={() => { setSelectedDay(day.date); setShowAddMeal(true); }}
                    className="text-sm text-[#7C9A82] mt-2 hover:underline"
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
              <label className="block text-sm font-medium text-[#636E72] mb-2">Pick a recipe</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recipes?.map(recipe => (
                  <button
                    key={recipe._id}
                    onClick={() => addMealToDay(recipe._id)}
                    className="w-full text-left p-3 bg-[#F8F9FA] hover:bg-[#E8F0E9] rounded-xl transition-colors"
                  >
                    {recipe.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm font-medium text-[#636E72] mb-2">Or add custom meal</label>
              <form onSubmit={(e) => {
                e.preventDefault();
                const input = (e.target as HTMLFormElement).elements.namedItem("custom") as HTMLInputElement;
                if (input.value.trim()) addMealToDay(undefined, input.value.trim());
              }}>
                <div className="flex gap-2">
                  <input name="custom" type="text" placeholder="e.g., Takeout Thai" className="flex-1" />
                  <button type="submit" className="btn-primary !py-3 !px-4">Add</button>
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

function EditItemModal({ item, onClose }: { item: any; onClose: () => void }) {
  const updateItem = useMutation(api.pantry.update);
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity || "");
  const [location, setLocation] = useState(item.location);
  const [expiresDate, setExpiresDate] = useState(
    item.expiresAt ? format(new Date(item.expiresAt), "yyyy-MM-dd") : ""
  );

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await updateItem({
      id: item._id,
      name: name.trim(),
      quantity: quantity || undefined,
      location,
      expiresAt: expiresDate ? new Date(expiresDate).getTime() : undefined,
    });
    onClose();
  };

  return (
    <Modal onClose={onClose} title="Edit Item">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#636E72] mb-2">Item name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#636E72] mb-2">Quantity</label>
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
                type="button"
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
          <label className="block text-sm font-medium text-[#636E72] mb-2">Expiration date</label>
          <input type="date" value={expiresDate} onChange={(e) => setExpiresDate(e.target.value)} />
        </div>
        <button onClick={handleSubmit} className="btn-primary w-full">Save Changes</button>
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

function EditRecipeForm({ recipe, onBack }: { recipe: any; onBack: () => void }) {
  const updateRecipe = useMutation(api.recipes.update);
  const [name, setName] = useState(recipe.name);
  const [source, setSource] = useState(recipe.source || "");
  const [servings, setServings] = useState(recipe.servings?.toString() || "");
  const [prepTime, setPrepTime] = useState(recipe.prepTime?.toString() || "");
  const [cookTime, setCookTime] = useState(recipe.cookTime?.toString() || "");
  const [tags, setTags] = useState(recipe.tags?.join(", ") || "");
  const [notes, setNotes] = useState(recipe.notes || "");
  const [ingredients, setIngredients] = useState(
    recipe.ingredients?.map((i: any) => `${i.quantity} ${i.name}${i.optional ? " (optional)" : ""}`).join("\n") || ""
  );
  const [instructions, setInstructions] = useState(recipe.instructions?.join("\n\n") || "");

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    const parsedIngredients = ingredients.split("\n").filter((l: string) => l.trim()).map((line: string) => {
      const isOptional = line.includes("(optional)");
      const cleanLine = line.replace("(optional)", "").trim();
      const match = cleanLine.match(/^([\d\/\s\w]+?)\s+(.+)$/);
      return match 
        ? { name: match[2].trim(), quantity: match[1].trim(), optional: isOptional || undefined } 
        : { name: cleanLine, quantity: "", optional: isOptional || undefined };
    });

    await updateRecipe({
      id: recipe._id,
      name: name.trim(),
      source: source || undefined,
      servings: servings ? parseInt(servings) : undefined,
      prepTime: prepTime ? parseInt(prepTime) : undefined,
      cookTime: cookTime ? parseInt(cookTime) : undefined,
      tags: tags.split(",").map((t: string) => t.trim()).filter(Boolean),
      notes: notes || undefined,
      ingredients: parsedIngredients,
      instructions: instructions.split("\n\n").filter((s: string) => s.trim()),
    });
    onBack();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-[#636E72] hover:text-[#2D3436] transition-colors">
          <div className="rotate-180"><Icons.chevronRight /></div> Cancel
        </button>
        <h2 className="text-xl font-bold text-[#2D3436]">Edit Recipe</h2>
        <div className="w-16" />
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#636E72] mb-2">Recipe name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#636E72] mb-2">Source (URL or book)</label>
          <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="https://..." />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#636E72] mb-2">Servings</label>
            <input type="number" value={servings} onChange={(e) => setServings(e.target.value)} placeholder="4" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#636E72] mb-2">Prep (min)</label>
            <input type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} placeholder="15" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#636E72] mb-2">Cook (min)</label>
            <input type="number" value={cookTime} onChange={(e) => setCookTime(e.target.value)} placeholder="30" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#636E72] mb-2">Tags (comma-separated)</label>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="quick, weeknight, healthy" />
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-medium text-[#636E72] mb-2">Ingredients (one per line)</label>
        <textarea 
          value={ingredients} 
          onChange={(e) => setIngredients(e.target.value)} 
          placeholder={"1 lb chicken breast\n2 cups broccoli\n1 tbsp olive oil (optional)"}
          rows={8}
        />
        <p className="text-xs text-[#B2BEC3] mt-1">Format: "quantity ingredient" — add (optional) for optional items</p>
      </div>

      <div className="card">
        <label className="block text-sm font-medium text-[#636E72] mb-2">Instructions (separate steps with blank line)</label>
        <textarea 
          value={instructions} 
          onChange={(e) => setInstructions(e.target.value)} 
          rows={10}
        />
      </div>

      <div className="card">
        <label className="block text-sm font-medium text-[#636E72] mb-2">Notes</label>
        <textarea 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          placeholder="Tips, variations, etc."
          rows={3}
        />
      </div>

      <button onClick={handleSubmit} className="btn-primary w-full">Save Changes</button>
    </div>
  );
}

// ============ HELPERS ============
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
