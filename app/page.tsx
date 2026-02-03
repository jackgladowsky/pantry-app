"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { 
  Refrigerator, 
  Snowflake, 
  Package, 
  Sparkles,
  ShoppingCart,
  BookOpen,
  AlertTriangle,
  Plus,
  Trash2,
  Check,
  ChefHat,
  Clock,
  Users,
  X,
  Search,
  Flame,
  ArrowRight,
  Home,
  ChevronRight,
  Pencil,
  UtensilsCrossed,
  CalendarDays,
  Wand2,
  ChevronLeft
} from "lucide-react";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";

const LOCATIONS = [
  { id: "fridge", name: "Fridge", icon: Refrigerator, color: "from-sky-400 to-blue-500", bg: "bg-sky-500/10" },
  { id: "freezer", name: "Freezer", icon: Snowflake, color: "from-violet-400 to-purple-500", bg: "bg-violet-500/10" },
  { id: "pantry", name: "Pantry", icon: Package, color: "from-amber-400 to-orange-500", bg: "bg-amber-500/10" },
  { id: "spices", name: "Spices", icon: Sparkles, color: "from-rose-400 to-pink-500", bg: "bg-rose-500/10" },
];

type Tab = "dashboard" | "pantry" | "recipes" | "planner" | "grocery";

export default function PantryApp() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [selectedRecipe, setSelectedRecipe] = useState<Id<"recipes"> | null>(null);
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Kitchen</h1>
                <p className="text-xs text-slate-400">Your culinary command center</p>
              </div>
            </div>
            
            {/* Nav */}
            <nav className="flex items-center gap-1 bg-slate-800/40 rounded-xl p-1">
              <NavButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")}>
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </NavButton>
              <NavButton active={activeTab === "pantry"} onClick={() => setActiveTab("pantry")}>
                <Refrigerator className="w-4 h-4" />
                <span className="hidden sm:inline">Pantry</span>
              </NavButton>
              <NavButton active={activeTab === "recipes"} onClick={() => setActiveTab("recipes")}>
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Recipes</span>
              </NavButton>
              <NavButton active={activeTab === "planner"} onClick={() => setActiveTab("planner")}>
                <CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline">Plan</span>
              </NavButton>
              <NavButton active={activeTab === "grocery"} onClick={() => setActiveTab("grocery")}>
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Grocery</span>
              </NavButton>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === "dashboard" && <Dashboard setActiveTab={setActiveTab} setSelectedRecipe={setSelectedRecipe} />}
        {activeTab === "pantry" && <PantryView />}
        {activeTab === "recipes" && <RecipesView selectedRecipe={selectedRecipe} setSelectedRecipe={setSelectedRecipe} />}
        {activeTab === "planner" && <MealPlannerView />}
        {activeTab === "grocery" && <GroceryView />}
      </main>
    </div>
  );
}

function NavButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
        active 
          ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
          : "text-slate-300 hover:text-white hover:bg-slate-700/60"
      }`}
    >
      {children}
    </button>
  );
}

// ============ DASHBOARD ============
function Dashboard({ setActiveTab, setSelectedRecipe }: { 
  setActiveTab: (tab: Tab) => void;
  setSelectedRecipe: (id: Id<"recipes"> | null) => void;
}) {
  const items = useQuery(api.pantry.list);
  const expiring = useQuery(api.pantry.expiringSoon, { withinDays: 7 });
  const canMake = useQuery(api.recipes.canMake);
  const groceryItems = useQuery(api.groceryList.list);
  
  const totalItems = items?.length || 0;
  const expiringCount = expiring?.length || 0;
  const readyRecipes = canMake?.filter(r => r.canMake).length || 0;
  const groceryCount = groceryItems?.filter(i => !i.checked).length || 0;
  
  const locationCounts = LOCATIONS.map(loc => ({
    ...loc,
    count: items?.filter(i => i.location === loc.id).length || 0
  }));

  return (
    <div className="space-y-8">
      {/* Expiring Alert */}
      {expiringCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5 pulse-warning">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-400 mb-1">Items expiring soon</h3>
              <p className="text-sm text-slate-300 mb-3">
                {expiringCount} item{expiringCount > 1 ? "s" : ""} will expire within the next 7 days
              </p>
              <div className="flex flex-wrap gap-2">
                {expiring?.slice(0, 5).map((item) => (
                  <span key={item._id} className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-sm">
                    {item.name} · {item.expiresAt ? formatDistanceToNow(item.expiresAt) : "soon"}
                  </span>
                ))}
                {(expiring?.length || 0) > 5 && (
                  <span className="text-amber-400 text-sm">+{(expiring?.length || 0) - 5} more</span>
                )}
              </div>
            </div>
            <button 
              onClick={() => setActiveTab("pantry")}
              className="text-amber-400 hover:text-amber-300"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Package className="w-5 h-5" />} label="Total Items" value={totalItems} color="emerald" onClick={() => setActiveTab("pantry")} />
        <StatCard icon={<ChefHat className="w-5 h-5" />} label="Ready to Cook" value={readyRecipes} color="blue" onClick={() => setActiveTab("recipes")} />
        <StatCard icon={<ShoppingCart className="w-5 h-5" />} label="Shopping List" value={groceryCount} color="purple" onClick={() => setActiveTab("grocery")} />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Expiring Soon" value={expiringCount} color={expiringCount > 0 ? "amber" : "zinc"} onClick={() => setActiveTab("pantry")} />
      </div>

      {/* Quick Storage Overview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Storage Overview</h2>
          <button onClick={() => setActiveTab("pantry")} className="text-sm text-green-400 hover:text-emerald-300 flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {locationCounts.map((loc) => {
            const Icon = loc.icon;
            return (
              <button key={loc.id} onClick={() => setActiveTab("pantry")} className="group bg-slate-800/40 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 rounded-2xl p-5 text-left transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${loc.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold mb-1">{loc.count}</p>
                <p className="text-sm text-slate-400">{loc.name}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Ready to Cook */}
      {readyRecipes > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Ready to Cook</h2>
            <button onClick={() => setActiveTab("recipes")} className="text-sm text-green-400 hover:text-emerald-300 flex items-center gap-1">
              All recipes <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {canMake?.filter(r => r.canMake).slice(0, 3).map((recipe) => (
              <button key={recipe._id} onClick={() => { setSelectedRecipe(recipe._id); setActiveTab("recipes"); }} className="group bg-slate-800/40 hover:bg-slate-700/50 border border-slate-700/50 hover:border-green-400/30 rounded-2xl p-5 text-left transition-all">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium group-hover:text-green-400 transition-colors">{recipe.name}</h3>
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">Ready</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  {recipe.prepTime && recipe.cookTime && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{recipe.prepTime + recipe.cookTime}m</span>}
                  {recipe.servings && <span className="flex items-center gap-1"><Users className="w-4 h-4" />{recipe.servings}</span>}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* AI Chef Suggestions */}
      <ChefAgent items={items} expiring={expiring} recipes={canMake} />
    </div>
  );
}

function ChefAgent({ items, expiring, recipes }: { items: any; expiring: any; recipes: any }) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestion = async () => {
    if (!items?.length) {
      setError("Add some items to your pantry first!");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pantryItems: items || [],
          recipes: recipes || [],
          expiringSoon: expiring || [],
        }),
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setSuggestion(data.suggestion);
      }
    } catch (err) {
      setError("Failed to get suggestions");
    }
    
    setLoading(false);
  };

  return (
    <section className="bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-500/20 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <UtensilsCrossed className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">AI Chef</h3>
          <p className="text-sm text-slate-400 mb-4">Get personalized meal suggestions based on what you have</p>
          
          {!suggestion && !loading && (
            <button
              onClick={getSuggestion}
              className="bg-violet-500 hover:bg-violet-600 px-4 py-2 rounded-xl font-medium transition-colors shadow-lg shadow-violet-500/20"
            >
              What should I cook?
            </button>
          )}
          
          {loading && (
            <div className="flex items-center gap-2 text-violet-400">
              <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              Thinking...
            </div>
          )}
          
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          
          {suggestion && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-xl p-4 text-slate-200 whitespace-pre-wrap text-sm leading-relaxed">
                {suggestion}
              </div>
              <button
                onClick={() => { setSuggestion(null); getSuggestion(); }}
                className="text-sm text-violet-400 hover:text-violet-300"
              >
                ↻ Get another suggestion
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, color, onClick }: { icon: React.ReactNode; label: string; value: number; color: string; onClick: () => void; }) {
  const colorClasses: Record<string, string> = {
    emerald: "from-emerald-500/20 to-emerald-600/20 text-green-400",
    blue: "from-blue-500/20 to-blue-600/20 text-blue-400",
    purple: "from-purple-500/20 to-purple-600/20 text-purple-400",
    amber: "from-amber-500/20 to-amber-600/20 text-amber-400",
    zinc: "from-zinc-500/20 to-zinc-600/20 text-slate-300",
  };
  return (
    <button onClick={onClick} className="bg-slate-800/40 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 rounded-2xl p-5 text-left transition-all group">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </button>
  );
}

// ============ PANTRY VIEW ============
function PantryView() {
  const items = useQuery(api.pantry.list);
  const addItem = useMutation(api.pantry.add);
  const updateItem = useMutation(api.pantry.update);
  const removeItem = useMutation(api.pantry.remove);
  
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingItem, setEditingItem] = useState<Doc<"pantryItems"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"expiry" | "name" | "added" | "location">("expiry");
  const [newItem, setNewItem] = useState({ name: "", quantity: "", location: "fridge", days: 7 });
  
  const filteredItems = items?.filter(item => {
    const matchesLocation = !selectedLocation || item.location === selectedLocation;
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLocation && matchesSearch;
  })?.sort((a, b) => {
    switch (sortBy) {
      case "expiry":
        // Items without expiry go last, then sort by soonest first
        if (!a.expiresAt && !b.expiresAt) return 0;
        if (!a.expiresAt) return 1;
        if (!b.expiresAt) return -1;
        return a.expiresAt - b.expiresAt;
      case "name":
        return a.name.localeCompare(b.name);
      case "added":
        return b.addedAt - a.addedAt; // newest first
      case "location":
        return a.location.localeCompare(b.location);
      default:
        return 0;
    }
  });
  
  const handleAdd = async () => {
    if (!newItem.name) return;
    await addItem({
      name: newItem.name,
      quantity: newItem.quantity || undefined,
      location: newItem.location,
      expiresAt: Date.now() + newItem.days * 24 * 60 * 60 * 1000,
    });
    setNewItem({ name: "", quantity: "", location: "fridge", days: 7 });
    setShowAdd(false);
  };

  const handleUpdate = async (updates: { name?: string; quantity?: string; location?: string; expiresAt?: number }) => {
    if (!editingItem) return;
    await updateItem({ id: editingItem._id, ...updates });
    setEditingItem(null);
  };

  const getExpiryStatus = (expiresAt: number | undefined) => {
    if (!expiresAt) return "none";
    const days = differenceInDays(expiresAt, Date.now());
    if (days < 0) return "expired";
    if (days <= 3) return "urgent";
    if (days <= 7) return "soon";
    return "ok";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Pantry</h2>
          <p className="text-slate-400">{items?.length || 0} items tracked</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 px-5 py-3 rounded-xl font-medium shadow-lg shadow-green-500/20 transition-all hover:scale-105">
          <Plus className="w-5 h-5" /> Add Item
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-green-400/50 transition-colors" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <FilterButton active={!selectedLocation} onClick={() => setSelectedLocation(null)}>All</FilterButton>
          {LOCATIONS.map((loc) => {
            const Icon = loc.icon;
            return <FilterButton key={loc.id} active={selectedLocation === loc.id} onClick={() => setSelectedLocation(loc.id)}><Icon className="w-4 h-4" /> {loc.name}</FilterButton>;
          })}
        </div>
      </div>

      {/* Sort options */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400">Sort by:</span>
        <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
          <button onClick={() => setSortBy("expiry")} className={`px-3 py-1 rounded-md transition-all ${sortBy === "expiry" ? "bg-green-500 text-white" : "text-slate-400 hover:text-white"}`}>Expiring</button>
          <button onClick={() => setSortBy("name")} className={`px-3 py-1 rounded-md transition-all ${sortBy === "name" ? "bg-green-500 text-white" : "text-slate-400 hover:text-white"}`}>Name</button>
          <button onClick={() => setSortBy("added")} className={`px-3 py-1 rounded-md transition-all ${sortBy === "added" ? "bg-green-500 text-white" : "text-slate-400 hover:text-white"}`}>Recent</button>
          <button onClick={() => setSortBy("location")} className={`px-3 py-1 rounded-md transition-all ${sortBy === "location" ? "bg-green-500 text-white" : "text-slate-400 hover:text-white"}`}>Location</button>
        </div>
      </div>

      <div className="grid gap-3">
        {filteredItems?.map((item) => {
          const status = getExpiryStatus(item.expiresAt);
          const loc = LOCATIONS.find(l => l.id === item.location);
          const Icon = loc?.icon || Package;
          return (
            <div key={item._id} className={`group flex items-center gap-4 bg-slate-800/40 hover:bg-slate-700/50 border rounded-xl p-4 transition-all card-glow ${status === "expired" ? "border-red-400/40 bg-red-500/10" : status === "urgent" ? "border-amber-400/40 bg-amber-500/10" : "border-slate-700/50 hover:border-slate-600"}`}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${loc?.color || "from-slate-500 to-slate-600"} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setEditingItem(item)}>
                <h3 className="font-medium truncate">{item.name}</h3>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  {item.quantity && <span>{item.quantity}</span>}
                  <span>{loc?.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item.expiresAt && (
                  <span className={`text-sm font-medium ${status === "expired" ? "text-red-400" : status === "urgent" ? "text-amber-400" : status === "soon" ? "text-yellow-400" : "text-slate-400"}`}>
                    {status === "expired" ? "Expired" : formatDistanceToNow(item.expiresAt, { addSuffix: true })}
                  </span>
                )}
                <button onClick={() => setEditingItem(item)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-green-400 transition-all"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => removeItem({ id: item._id })} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
        {filteredItems?.length === 0 && <div className="text-center py-16 text-slate-400"><Package className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No items found</p></div>}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="Add Item">
          <PantryItemForm item={newItem} setItem={setNewItem} onSubmit={handleAdd} submitLabel="Add Item" />
        </Modal>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <Modal onClose={() => setEditingItem(null)} title="Edit Item">
          <EditPantryItemForm item={editingItem} onSubmit={handleUpdate} onDelete={() => { removeItem({ id: editingItem._id }); setEditingItem(null); }} />
        </Modal>
      )}
    </div>
  );
}

function PantryItemForm({ item, setItem, onSubmit, submitLabel }: { item: { name: string; quantity: string; location: string; days: number }; setItem: (item: any) => void; onSubmit: () => void; submitLabel: string }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-slate-300 mb-2">Item Name</label>
        <input type="text" placeholder="e.g. Milk" value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} className="w-full bg-slate-700/60 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400/50" autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-300 mb-2">Quantity</label>
          <input type="text" placeholder="e.g. 1 gallon" value={item.quantity} onChange={(e) => setItem({ ...item, quantity: e.target.value })} className="w-full bg-slate-700/60 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400/50" />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-2">Days Until Expiry</label>
          <input type="number" value={item.days} onChange={(e) => setItem({ ...item, days: parseInt(e.target.value) || 7 })} className="w-full bg-slate-700/60 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400/50" />
        </div>
      </div>
      <div>
        <label className="block text-sm text-slate-300 mb-2">Location</label>
        <div className="grid grid-cols-2 gap-2">
          {LOCATIONS.map((loc) => {
            const Icon = loc.icon;
            return <button key={loc.id} type="button" onClick={() => setItem({ ...item, location: loc.id })} className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${item.location === loc.id ? "border-green-400 bg-green-500/10" : "border-slate-600 hover:border-zinc-600"}`}><Icon className="w-5 h-5" /> {loc.name}</button>;
          })}
        </div>
      </div>
      <button onClick={onSubmit} disabled={!item.name} className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl font-medium transition-colors">{submitLabel}</button>
    </div>
  );
}

function EditPantryItemForm({ item, onSubmit, onDelete }: { item: Doc<"pantryItems">; onSubmit: (updates: any) => void; onDelete: () => void }) {
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity || "");
  const [location, setLocation] = useState(item.location);
  const [days, setDays] = useState(item.expiresAt ? Math.max(0, differenceInDays(item.expiresAt, Date.now())) : 7);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-slate-400 mb-2">Item Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400/50 focus:bg-slate-800" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Quantity</label>
          <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400/50" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-2">Days Until Expiry</label>
          <input type="number" value={days} onChange={(e) => setDays(parseInt(e.target.value) || 0)} className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400/50" />
        </div>
      </div>
      <div>
        <label className="block text-sm text-slate-400 mb-2">Location</label>
        <div className="grid grid-cols-2 gap-2">
          {LOCATIONS.map((loc) => {
            const Icon = loc.icon;
            return <button key={loc.id} type="button" onClick={() => setLocation(loc.id)} className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${location === loc.id ? "border-green-400 bg-green-500/15 text-green-300" : "border-slate-600/50 hover:border-slate-500 text-slate-300"}`}><Icon className="w-5 h-5" /> {loc.name}</button>;
          })}
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => onSubmit({ name, quantity: quantity || undefined, location, expiresAt: Date.now() + days * 24 * 60 * 60 * 1000 })} className="flex-1 bg-green-500 hover:bg-green-600 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-green-500/20">Save Changes</button>
        <button onClick={onDelete} className="px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${active ? "bg-green-500 text-white" : "bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-slate-600 hover:text-white"}`}>{children}</button>;
}

// ============ RECIPES VIEW ============
function RecipesView({ selectedRecipe, setSelectedRecipe }: { selectedRecipe: Id<"recipes"> | null; setSelectedRecipe: (id: Id<"recipes"> | null) => void; }) {
  const canMake = useQuery(api.recipes.canMake);
  const updateRecipe = useMutation(api.recipes.update);
  const deleteRecipe = useMutation(api.recipes.remove);
  const addToGrocery = useMutation(api.groceryList.addFromRecipe);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  const recipe = canMake?.find(r => r._id === selectedRecipe);
  const allTags = [...new Set(canMake?.flatMap(r => r.tags) || [])];
  
  const filteredRecipes = canMake?.filter(r => {
    const matchesSearch = !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !filterTag || r.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  if (recipe) {
    if (editMode) {
      return <EditRecipeView recipe={recipe} onSave={async (updates) => { await updateRecipe({ id: recipe._id, ...updates }); setEditMode(false); }} onCancel={() => setEditMode(false)} onDelete={async () => { await deleteRecipe({ id: recipe._id }); setSelectedRecipe(null); }} />;
    }
    
    return (
      <div className="max-w-3xl mx-auto">
        <button onClick={() => setSelectedRecipe(null)} className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to recipes
        </button>
        
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{recipe.name}</h1>
                {recipe.source && <p className="text-sm text-slate-400">{recipe.source}</p>}
              </div>
              <div className="flex items-center gap-2">
                {recipe.canMake && <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">Ready to cook!</span>}
                <button onClick={() => setEditMode(true)} className="p-2 text-slate-300 hover:text-green-400 hover:bg-slate-700/60 rounded-lg transition-all"><Pencil className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              {recipe.prepTime && <div className="flex items-center gap-2 text-slate-300"><Clock className="w-4 h-4" /><span>Prep: {recipe.prepTime}m</span></div>}
              {recipe.cookTime && <div className="flex items-center gap-2 text-slate-300"><Flame className="w-4 h-4" /><span>Cook: {recipe.cookTime}m</span></div>}
              {recipe.servings && <div className="flex items-center gap-2 text-slate-300"><Users className="w-4 h-4" /><span>{recipe.servings} servings</span></div>}
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              {recipe.tags.map((tag) => <span key={tag} className="bg-slate-700/60 text-slate-300 px-3 py-1 rounded-full text-sm">{tag}</span>)}
            </div>
          </div>
          
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="font-semibold mb-4">Ingredients</h2>
            <div className="grid gap-2">
              {recipe.ingredients.map((ing, i) => {
                const have = !recipe.missing.includes(ing.name);
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${have ? "bg-green-500/10" : "bg-slate-700/60"}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${have ? "bg-green-500" : "border-2 border-zinc-600"}`}>
                      {have && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className={ing.optional ? "text-slate-400" : ""}>{ing.quantity} {ing.name}</span>
                    {ing.optional && <span className="text-zinc-600 text-sm">(optional)</span>}
                  </div>
                );
              })}
            </div>
            {!recipe.canMake && <button onClick={() => addToGrocery({ recipeId: recipe._id })} className="mt-4 w-full bg-green-500 hover:bg-green-600 py-3 rounded-xl font-medium transition-colors">Add missing items to grocery list</button>}
          </div>
          
          <div className="p-6">
            <h2 className="font-semibold mb-4">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-slate-700/60 flex items-center justify-center text-sm font-medium flex-shrink-0">{i + 1}</span>
                  <p className="text-zinc-300 pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>
          
          {recipe.notes && (
            <div className="p-6 border-t border-slate-700/50 bg-slate-700/60/30">
              <h2 className="font-semibold mb-2">Notes</h2>
              <p className="text-slate-300">{recipe.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Recipes</h2>
        <p className="text-slate-400">{canMake?.filter(r => r.canMake).length || 0} recipes ready to cook</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Search recipes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-green-400/50 transition-colors" />
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <FilterButton active={!filterTag} onClick={() => setFilterTag(null)}>All</FilterButton>
        {allTags.map((tag) => <FilterButton key={tag} active={filterTag === tag} onClick={() => setFilterTag(tag)}>{tag}</FilterButton>)}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {filteredRecipes?.map((recipe) => (
          <button key={recipe._id} onClick={() => setSelectedRecipe(recipe._id)} className={`group bg-slate-800/40 hover:bg-slate-700/50 border rounded-2xl p-5 text-left transition-all ${recipe.canMake ? "border-green-400/30 hover:border-green-400/50" : "border-slate-700/50 hover:border-slate-600"}`}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium text-lg group-hover:text-green-400 transition-colors">{recipe.name}</h3>
              {recipe.canMake && <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">Ready!</span>}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
              {recipe.prepTime && recipe.cookTime && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{recipe.prepTime + recipe.cookTime}m</span>}
              {recipe.servings && <span className="flex items-center gap-1"><Users className="w-4 h-4" />{recipe.servings}</span>}
              <span className="flex items-center gap-1"><Package className="w-4 h-4" />{recipe.haveCount}/{recipe.ingredients.length}</span>
            </div>
            {!recipe.canMake && recipe.missing.length > 0 && <p className="text-sm text-amber-400/80 mb-3">Missing: {recipe.missing.slice(0, 3).join(", ")}{recipe.missing.length > 3 && ` +${recipe.missing.length - 3}`}</p>}
            <div className="flex gap-2 flex-wrap">
              {recipe.tags.slice(0, 3).map((tag) => <span key={tag} className="bg-slate-700/60 text-slate-400 text-xs px-2 py-1 rounded-full">{tag}</span>)}
            </div>
          </button>
        ))}
      </div>
      
      {filteredRecipes?.length === 0 && <div className="text-center py-16 text-slate-400"><BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No recipes found</p></div>}
    </div>
  );
}

function EditRecipeView({ recipe, onSave, onCancel, onDelete }: { recipe: any; onSave: (updates: any) => void; onCancel: () => void; onDelete: () => void }) {
  const [name, setName] = useState(recipe.name);
  const [source, setSource] = useState(recipe.source || "");
  const [servings, setServings] = useState(recipe.servings || 2);
  const [prepTime, setPrepTime] = useState(recipe.prepTime || 10);
  const [cookTime, setCookTime] = useState(recipe.cookTime || 20);
  const [tags, setTags] = useState(recipe.tags.join(", "));
  const [ingredients, setIngredients] = useState(recipe.ingredients.map((i: any) => `${i.quantity} ${i.name}${i.optional ? " (optional)" : ""}`).join("\n"));
  const [instructions, setInstructions] = useState(recipe.instructions.join("\n\n"));
  const [notes, setNotes] = useState(recipe.notes || "");

  const handleSave = () => {
    const parsedIngredients = ingredients.split("\n").filter(l => l.trim()).map(line => {
      const optional = line.includes("(optional)");
      const clean = line.replace("(optional)", "").trim();
      const match = clean.match(/^([\d\/\s\w]+?)\s+(.+)$/);
      if (match) return { quantity: match[1].trim(), name: match[2].trim(), optional };
      return { quantity: "", name: clean, optional };
    });
    
    onSave({
      name,
      source: source || undefined,
      servings,
      prepTime,
      cookTime,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      ingredients: parsedIngredients,
      instructions: instructions.split("\n\n").filter(s => s.trim()),
      notes: notes || undefined,
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onCancel} className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors">
        <ChevronRight className="w-4 h-4 rotate-180" /> Cancel editing
      </button>
      
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-6">
        <h2 className="text-xl font-bold">Edit Recipe</h2>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">Recipe Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-700/60 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400/50" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">Source</label>
            <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. NYT Cooking" className="w-full bg-slate-700/60 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400/50" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Servings</label>
            <input type="number" value={servings} onChange={(e) => setServings(parseInt(e.target.value) || 2)} className="w-full bg-slate-700/60 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Prep (min)</label>
              <input type="number" value={prepTime} onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)} className="w-full bg-slate-700/60 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400/50" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Cook (min)</label>
              <input type="number" value={cookTime} onChange={(e) => setCookTime(parseInt(e.target.value) || 0)} className="w-full bg-slate-700/60 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400/50" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">Tags (comma separated)</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="quick, seafood, weeknight" className="w-full bg-slate-700/60 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400/50" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">Ingredients (one per line: "quantity name")</label>
            <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={8} placeholder="1 lb shrimp&#10;3 Tbsp soy sauce&#10;1 Tbsp garlic (optional)" className="w-full bg-slate-700/60 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400/50 font-mono text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">Instructions (separate steps with blank line)</label>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={10} className="w-full bg-slate-700/60 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400/50" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Personal notes, modifications, etc." className="w-full bg-slate-700/60 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-green-400/50" />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={handleSave} className="flex-1 bg-green-500 hover:bg-green-600 py-3 rounded-xl font-medium transition-colors">Save Changes</button>
          <button onClick={onDelete} className="px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
}

// ============ MEAL PLANNER VIEW ============
function MealPlannerView() {
  const recipes = useQuery(api.recipes.list);
  const pantryItems = useQuery(api.pantry.list);
  const setMeals = useMutation(api.mealPlans.setMeals);
  
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(today.setDate(diff));
  });
  
  const weekPlans = useQuery(api.mealPlans.getWeek, {
    startDate: format(weekStart, "yyyy-MM-dd"),
    endDate: format(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
  });
  
  const groceryNeeds = useQuery(api.mealPlans.getGroceryList, {
    startDate: format(weekStart, "yyyy-MM-dd"),
    endDate: format(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
  });
  
  const [generating, setGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [viewingRecipeId, setViewingRecipeId] = useState<string | null>(null);
  const [generatingMealName, setGeneratingMealName] = useState<string | null>(null);
  const [generatedRecipe, setGeneratedRecipe] = useState<any | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const addRecipe = useMutation(api.recipes.add);
  
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
    return {
      date: format(date, "yyyy-MM-dd"),
      dayName: format(date, "EEE"),
      dayNum: format(date, "d"),
      isToday: format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"),
    };
  });
  
  const getMealsForDate = (date: string) => {
    const plan = weekPlans?.find(p => p.date === date);
    return plan?.meals || [];
  };
  
  const getRecipeName = (recipeId: string) => {
    return recipes?.find(r => r._id === recipeId)?.name || "Unknown Recipe";
  };
  
  const getRecipe = (recipeId: string) => {
    return recipes?.find(r => r._id === recipeId);
  };

  const handleMealClick = async (meal: any) => {
    if (meal.recipeId) {
      // Existing recipe - show it
      setViewingRecipeId(meal.recipeId);
    } else if (meal.customMeal) {
      // Custom meal - generate a recipe
      setGeneratingMealName(meal.customMeal);
      setLoadingRecipe(true);
      setGeneratedRecipe(null);
      try {
        const res = await fetch("/api/generate-recipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mealName: meal.customMeal,
            pantryItems: pantryItems || [],
          }),
        });
        const data = await res.json();
        if (data.recipe) {
          setGeneratedRecipe(data.recipe);
        }
      } catch (err) {
        console.error("Failed to generate recipe:", err);
      }
      setLoadingRecipe(false);
    }
  };

  const saveGeneratedRecipe = async () => {
    if (!generatedRecipe) return;
    try {
      await addRecipe({
        name: generatedRecipe.name,
        servings: generatedRecipe.servings || 2,
        prepTime: generatedRecipe.prepTime,
        cookTime: generatedRecipe.cookTime,
        tags: generatedRecipe.tags || [],
        ingredients: generatedRecipe.ingredients || [],
        instructions: generatedRecipe.instructions || [],
        notes: generatedRecipe.notes,
      });
      setGeneratedRecipe(null);
      setGeneratingMealName(null);
    } catch (err) {
      console.error("Failed to save recipe:", err);
    }
  };
  
  const generateWeekPlan = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/plan-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pantryItems: pantryItems || [],
          recipes: recipes || [],
          startDate: format(weekStart, "yyyy-MM-dd"),
          preferences: "Prefer variety, quick weeknight meals",
        }),
      });
      
      const data = await res.json();
      
      if (data.plan) {
        // Save each day's plan
        for (const day of data.plan) {
          const meal = {
            type: "dinner" as const,
            recipeId: day.recipeId || undefined,
            customMeal: day.recipeId ? undefined : day.meal,
            notes: day.notes || undefined,
          };
          await setMeals({ date: day.date, meals: [meal] });
        }
      }
    } catch (err) {
      console.error("Failed to generate plan:", err);
    }
    setGenerating(false);
  };
  
  const addMealToDay = async (date: string, recipeId?: string, customMeal?: string) => {
    const existingMeals = getMealsForDate(date);
    const newMeal = {
      type: "dinner",
      recipeId: recipeId || undefined,
      customMeal: customMeal || undefined,
    };
    await setMeals({ date, meals: [...existingMeals, newMeal] });
    setShowRecipePicker(false);
    setSelectedDay(null);
  };
  
  const removeMealFromDay = async (date: string, index: number) => {
    const existingMeals = getMealsForDate(date);
    const newMeals = existingMeals.filter((_, i) => i !== index);
    await setMeals({ date, meals: newMeals });
  };
  
  const prevWeek = () => setWeekStart(new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000));
  const nextWeek = () => setWeekStart(new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000));
  const thisWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    setWeekStart(new Date(today.setDate(diff)));
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold mb-1">Meal Planner</h2>
          <p className="text-slate-400">Plan your week, eat what you have</p>
        </div>
        <button
          onClick={generateWeekPlan}
          disabled={generating}
          className="flex items-center gap-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 px-5 py-3 rounded-xl font-medium shadow-lg shadow-violet-500/20 transition-all"
        >
          {generating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Planning...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              AI Plan My Week
            </>
          )}
        </button>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-slate-800/40 rounded-xl p-2">
        <button onClick={prevWeek} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          <span className="font-medium">
            {format(weekStart, "MMM d")} - {format(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000), "MMM d, yyyy")}
          </span>
          <button onClick={thisWeek} className="text-sm text-green-400 hover:text-green-300">
            Today
          </button>
        </div>
        <button onClick={nextWeek} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-3">
        {days.map((day) => {
          const meals = getMealsForDate(day.date);
          return (
            <div
              key={day.date}
              className={`bg-slate-800/40 rounded-xl p-3 min-h-[200px] border transition-all ${
                day.isToday ? "border-green-400/50 bg-green-500/5" : "border-slate-700/50"
              }`}
            >
              <div className="text-center mb-3">
                <div className="text-xs text-slate-400">{day.dayName}</div>
                <div className={`text-lg font-bold ${day.isToday ? "text-green-400" : ""}`}>{day.dayNum}</div>
              </div>
              
              <div className="space-y-2">
                {meals.map((meal, i) => (
                  <div 
                    key={i} 
                    onClick={() => handleMealClick(meal)}
                    className="group relative bg-slate-700/50 hover:bg-slate-600/50 rounded-lg p-2 text-sm cursor-pointer transition-colors"
                  >
                    <div className="font-medium leading-tight">
                      {meal.recipeId ? getRecipeName(meal.recipeId) : meal.customMeal}
                    </div>
                    {meal.notes && <div className="text-slate-400 text-xs mt-1 line-clamp-2">{meal.notes}</div>}
                    {!meal.recipeId && <div className="text-violet-400 text-xs mt-1">Click to generate recipe</div>}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeMealFromDay(day.date, i); }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={() => { setSelectedDay(day.date); setShowRecipePicker(true); }}
                  className="w-full py-2 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-green-400 hover:text-green-400 transition-colors text-xs"
                >
                  + Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grocery Needs for this week */}
      {groceryNeeds && groceryNeeds.length > 0 && (
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-400" />
            Shopping list for this week
          </h3>
          <div className="flex flex-wrap gap-2">
            {groceryNeeds.map((item, i) => (
              <span key={i} className="bg-slate-700/50 px-3 py-1 rounded-full text-sm">
                {item.name} <span className="text-slate-400">({item.quantity})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recipe Picker Modal */}
      {showRecipePicker && selectedDay && (
        <Modal onClose={() => { setShowRecipePicker(false); setSelectedDay(null); }} title="Add Meal">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Pick a recipe</label>
              <div className="grid gap-2 max-h-60 overflow-y-auto">
                {recipes?.map((recipe) => (
                  <button
                    key={recipe._id}
                    onClick={() => addMealToDay(selectedDay, recipe._id)}
                    className="text-left p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-colors"
                  >
                    <div className="font-medium">{recipe.name}</div>
                    <div className="text-xs text-slate-400">
                      {recipe.prepTime && recipe.cookTime && `${recipe.prepTime + recipe.cookTime}min`}
                      {recipe.tags?.length > 0 && ` • ${recipe.tags.slice(0, 2).join(", ")}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-slate-700 pt-4">
              <label className="block text-sm text-slate-400 mb-2">Or add a custom meal</label>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.elements.namedItem("customMeal") as HTMLInputElement;
                if (input.value.trim()) {
                  addMealToDay(selectedDay, undefined, input.value.trim());
                }
              }}>
                <div className="flex gap-2">
                  <input
                    name="customMeal"
                    type="text"
                    placeholder="e.g., Takeout sushi"
                    className="flex-1 bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-2 focus:outline-none focus:border-green-400/50"
                  />
                  <button type="submit" className="bg-green-500 hover:bg-green-600 px-4 rounded-xl transition-colors">
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}

      {/* View Existing Recipe Modal */}
      {viewingRecipeId && (
        <Modal onClose={() => setViewingRecipeId(null)} title="Recipe Details">
          {(() => {
            const recipe = getRecipe(viewingRecipeId);
            if (!recipe) return <p>Recipe not found</p>;
            return (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <h3 className="text-xl font-bold">{recipe.name}</h3>
                  {recipe.source && <p className="text-sm text-slate-400">{recipe.source}</p>}
                </div>
                <div className="flex gap-4 text-sm text-slate-300">
                  {recipe.prepTime && <span>Prep: {recipe.prepTime}m</span>}
                  {recipe.cookTime && <span>Cook: {recipe.cookTime}m</span>}
                  {recipe.servings && <span>{recipe.servings} servings</span>}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Ingredients</h4>
                  <ul className="space-y-1">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i} className="text-slate-300">• {ing.quantity} {ing.name}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Instructions</h4>
                  <ol className="space-y-2">
                    {recipe.instructions.map((step, i) => (
                      <li key={i} className="text-slate-300"><span className="text-green-400 font-medium">{i + 1}.</span> {step}</li>
                    ))}
                  </ol>
                </div>
                {recipe.notes && (
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <h4 className="font-semibold mb-1">Notes</h4>
                    <p className="text-slate-300 text-sm">{recipe.notes}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Generate Recipe Modal */}
      {(generatingMealName || generatedRecipe) && (
        <Modal onClose={() => { setGeneratingMealName(null); setGeneratedRecipe(null); }} title={generatedRecipe ? "Generated Recipe" : "Generating Recipe..."}>
          {loadingRecipe ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-400">Generating recipe for "{generatingMealName}"...</p>
            </div>
          ) : generatedRecipe ? (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <h3 className="text-xl font-bold">{generatedRecipe.name}</h3>
                <p className="text-sm text-violet-400">AI-generated recipe</p>
              </div>
              <div className="flex gap-4 text-sm text-slate-300">
                {generatedRecipe.prepTime && <span>Prep: {generatedRecipe.prepTime}m</span>}
                {generatedRecipe.cookTime && <span>Cook: {generatedRecipe.cookTime}m</span>}
                {generatedRecipe.servings && <span>{generatedRecipe.servings} servings</span>}
              </div>
              <div>
                <h4 className="font-semibold mb-2">Ingredients</h4>
                <ul className="space-y-1">
                  {generatedRecipe.ingredients?.map((ing: any, i: number) => (
                    <li key={i} className="text-slate-300">• {ing.quantity} {ing.name}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Instructions</h4>
                <ol className="space-y-2">
                  {generatedRecipe.instructions?.map((step: string, i: number) => (
                    <li key={i} className="text-slate-300"><span className="text-green-400 font-medium">{i + 1}.</span> {step}</li>
                  ))}
                </ol>
              </div>
              <div className="flex gap-2 pt-4 border-t border-slate-700">
                <button 
                  onClick={saveGeneratedRecipe}
                  className="flex-1 bg-green-500 hover:bg-green-600 py-2 rounded-xl font-medium transition-colors"
                >
                  Save to Recipes
                </button>
                <button 
                  onClick={() => { setGeneratedRecipe(null); setGeneratingMealName(null); }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 py-4">Something went wrong. Try again.</p>
          )}
        </Modal>
      )}
    </div>
  );
}

// ============ GROCERY VIEW ============
function GroceryView() {
  const items = useQuery(api.groceryList.list);
  const addItem = useMutation(api.groceryList.add);
  const updateItem = useMutation(api.groceryList.update);
  const toggleItem = useMutation(api.groceryList.toggle);
  const removeItem = useMutation(api.groceryList.remove);
  const clearChecked = useMutation(api.groceryList.clearChecked);
  
  const [newItem, setNewItem] = useState("");
  const [editingId, setEditingId] = useState<Id<"groceryList"> | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingQty, setEditingQty] = useState("");
  
  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await addItem({ name: newItem.trim() });
    setNewItem("");
  };

  const startEdit = (item: Doc<"groceryList">) => {
    setEditingId(item._id);
    setEditingName(item.name);
    setEditingQty(item.quantity || "");
  };

  const saveEdit = async () => {
    if (!editingId || !editingName.trim()) return;
    await updateItem({ id: editingId, name: editingName.trim(), quantity: editingQty.trim() || undefined });
    setEditingId(null);
  };
  
  const unchecked = items?.filter(i => !i.checked) || [];
  const checked = items?.filter(i => i.checked) || [];
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Grocery List</h2>
        <p className="text-slate-400">{unchecked.length} items to get</p>
      </div>
      
      <div className="flex gap-3">
        <input type="text" placeholder="Add item..." value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-5 py-4 focus:outline-none focus:border-green-400/50 transition-colors text-lg" />
        <button onClick={handleAdd} className="bg-green-500 hover:bg-green-600 px-6 rounded-xl transition-colors"><Plus className="w-6 h-6" /></button>
      </div>
      
      <div className="space-y-2">
        {unchecked.map((item) => (
          <div key={item._id} className="group flex items-center gap-4 bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 rounded-xl p-4 transition-all">
            <button onClick={() => toggleItem({ id: item._id })} className="w-7 h-7 border-2 border-zinc-600 hover:border-green-400 rounded-lg transition-colors flex-shrink-0" />
            {editingId === item._id ? (
              <div className="flex-1 flex gap-2">
                <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveEdit()} className="flex-1 bg-slate-700/60 border border-slate-600 rounded-lg px-3 py-1 focus:outline-none focus:border-green-400/50" autoFocus />
                <input type="text" value={editingQty} onChange={(e) => setEditingQty(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveEdit()} placeholder="Qty" className="w-20 bg-slate-700/60 border border-slate-600 rounded-lg px-3 py-1 focus:outline-none focus:border-green-400/50" />
                <button onClick={saveEdit} className="text-green-400 hover:text-emerald-300"><Check className="w-5 h-5" /></button>
                <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-zinc-300"><X className="w-5 h-5" /></button>
              </div>
            ) : (
              <>
                <span className="flex-1 text-lg cursor-pointer" onClick={() => startEdit(item)}>{item.name}</span>
                {item.quantity && <span className="text-slate-400">{item.quantity}</span>}
                <button onClick={() => startEdit(item)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-green-400 transition-all"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => removeItem({ id: item._id })} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all"><Trash2 className="w-5 h-5" /></button>
              </>
            )}
          </div>
        ))}
      </div>
      
      {checked.length > 0 && (
        <div className="pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400">Completed ({checked.length})</span>
            <button onClick={() => clearChecked()} className="text-sm text-red-400 hover:text-red-300 transition-colors">Clear all</button>
          </div>
          <div className="space-y-2 opacity-60">
            {checked.map((item) => (
              <div key={item._id} className="flex items-center gap-4 bg-slate-800/50/30 rounded-xl p-4">
                <button onClick={() => toggleItem({ id: item._id })} className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center"><Check className="w-4 h-4" /></button>
                <span className="flex-1 text-lg line-through text-slate-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {items?.length === 0 && <div className="text-center py-16 text-slate-400"><ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>Your grocery list is empty</p><p className="text-sm mt-1">Add items or generate from recipes</p></div>}
    </div>
  );
}

// ============ MODAL ============
function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800/50 border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
