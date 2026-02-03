"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { 
  Refrigerator, 
  Snowflake, 
  Package, 
  Salad,
  ShoppingCart,
  BookOpen,
  AlertTriangle,
  Plus,
  Trash2,
  Check
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const LOCATIONS = [
  { id: "fridge", name: "Fridge", icon: Refrigerator },
  { id: "freezer", name: "Freezer", icon: Snowflake },
  { id: "pantry", name: "Pantry", icon: Package },
  { id: "spices", name: "Spices", icon: Salad },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"pantry" | "recipes" | "grocery">("pantry");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">🍳 Pantry</h1>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <TabButton active={activeTab === "pantry"} onClick={() => setActiveTab("pantry")}>
          <Refrigerator className="w-4 h-4" /> Pantry
        </TabButton>
        <TabButton active={activeTab === "recipes"} onClick={() => setActiveTab("recipes")}>
          <BookOpen className="w-4 h-4" /> Recipes
        </TabButton>
        <TabButton active={activeTab === "grocery"} onClick={() => setActiveTab("grocery")}>
          <ShoppingCart className="w-4 h-4" /> Grocery List
        </TabButton>
      </div>
      
      {activeTab === "pantry" && <PantryView selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} />}
      {activeTab === "recipes" && <RecipesView />}
      {activeTab === "grocery" && <GroceryView />}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        active ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
      }`}
    >
      {children}
    </button>
  );
}

function PantryView({ selectedLocation, setSelectedLocation }: { 
  selectedLocation: string | null; 
  setSelectedLocation: (loc: string | null) => void;
}) {
  const items = useQuery(api.pantry.list);
  const expiring = useQuery(api.pantry.expiringSoon, { withinDays: 7 });
  const addItem = useMutation(api.pantry.add);
  const removeItem = useMutation(api.pantry.remove);
  
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", quantity: "", location: "fridge", days: 7 });
  
  const filteredItems = selectedLocation 
    ? items?.filter(i => i.location === selectedLocation) 
    : items;
  
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
  
  return (
    <div>
      {/* Expiring Warning */}
      {expiring && expiring.length > 0 && (
        <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-amber-400 font-medium mb-2">
            <AlertTriangle className="w-5 h-5" /> Expiring Soon
          </div>
          <div className="flex flex-wrap gap-2">
            {expiring.map((item) => (
              <span key={item._id} className="bg-amber-900/50 px-2 py-1 rounded text-sm">
                {item.name} ({item.expiresAt ? formatDistanceToNow(item.expiresAt, { addSuffix: true }) : "?"})
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Location Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setSelectedLocation(null)}
          className={`px-3 py-1 rounded ${!selectedLocation ? "bg-emerald-600" : "bg-zinc-800"}`}
        >
          All
        </button>
        {LOCATIONS.map((loc) => {
          const Icon = loc.icon;
          return (
            <button
              key={loc.id}
              onClick={() => setSelectedLocation(loc.id)}
              className={`flex items-center gap-1 px-3 py-1 rounded ${
                selectedLocation === loc.id ? "bg-emerald-600" : "bg-zinc-800"
              }`}
            >
              <Icon className="w-4 h-4" /> {loc.name}
            </button>
          );
        })}
      </div>
      
      {/* Add Button */}
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg mb-4"
      >
        <Plus className="w-4 h-4" /> Add Item
      </button>
      
      {/* Add Form */}
      {showAdd && (
        <div className="bg-zinc-800 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="bg-zinc-700 rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Quantity (optional)"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="bg-zinc-700 rounded px-3 py-2"
            />
            <select
              value={newItem.location}
              onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
              className="bg-zinc-700 rounded px-3 py-2"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Days until expiry"
              value={newItem.days}
              onChange={(e) => setNewItem({ ...newItem, days: parseInt(e.target.value) || 7 })}
              className="bg-zinc-700 rounded px-3 py-2"
            />
          </div>
          <button onClick={handleAdd} className="bg-emerald-600 px-4 py-2 rounded">
            Add
          </button>
        </div>
      )}
      
      {/* Items List */}
      <div className="grid gap-2">
        {filteredItems?.map((item) => (
          <div key={item._id} className="flex items-center justify-between bg-zinc-800 rounded-lg p-3">
            <div>
              <span className="font-medium">{item.name}</span>
              {item.quantity && <span className="text-zinc-400 ml-2">({item.quantity})</span>}
              <span className="text-zinc-500 text-sm ml-2">
                {LOCATIONS.find(l => l.id === item.location)?.name}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {item.expiresAt && (
                <span className={`text-sm ${
                  item.expiresAt < Date.now() ? "text-red-400" :
                  item.expiresAt < Date.now() + 3 * 24 * 60 * 60 * 1000 ? "text-amber-400" :
                  "text-zinc-400"
                }`}>
                  {formatDistanceToNow(item.expiresAt, { addSuffix: true })}
                </span>
              )}
              <button onClick={() => removeItem({ id: item._id })} className="text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {filteredItems?.length === 0 && (
          <div className="text-zinc-500 text-center py-8">No items</div>
        )}
      </div>
    </div>
  );
}

function RecipesView() {
  const recipes = useQuery(api.recipes.list);
  const canMake = useQuery(api.recipes.canMake);
  const addToGrocery = useMutation(api.groceryList.addFromRecipe);
  
  return (
    <div>
      <div className="mb-4 text-zinc-400">
        {canMake?.filter(r => r.canMake).length || 0} recipes you can make now
      </div>
      
      <div className="grid gap-4">
        {canMake?.map((recipe) => (
          <div key={recipe._id} className={`bg-zinc-800 rounded-lg p-4 ${recipe.canMake ? "border border-emerald-600" : ""}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-lg">{recipe.name}</h3>
              {recipe.canMake && (
                <span className="bg-emerald-600 text-xs px-2 py-1 rounded">Can Make!</span>
              )}
            </div>
            
            {recipe.prepTime && recipe.cookTime && (
              <div className="text-sm text-zinc-400 mb-2">
                {recipe.prepTime + recipe.cookTime} min total
              </div>
            )}
            
            {!recipe.canMake && recipe.missing.length > 0 && (
              <div className="text-sm text-amber-400 mb-2">
                Missing: {recipe.missing.join(", ")}
              </div>
            )}
            
            <div className="flex gap-2 flex-wrap mt-2">
              {recipe.tags.map((tag) => (
                <span key={tag} className="bg-zinc-700 text-xs px-2 py-1 rounded">{tag}</span>
              ))}
            </div>
            
            {!recipe.canMake && (
              <button
                onClick={() => addToGrocery({ recipeId: recipe._id })}
                className="mt-3 text-sm text-emerald-400 hover:text-emerald-300"
              >
                + Add missing to grocery list
              </button>
            )}
          </div>
        ))}
        {recipes?.length === 0 && (
          <div className="text-zinc-500 text-center py-8">No recipes yet</div>
        )}
      </div>
    </div>
  );
}

function GroceryView() {
  const items = useQuery(api.groceryList.list);
  const addItem = useMutation(api.groceryList.add);
  const toggleItem = useMutation(api.groceryList.toggle);
  const removeItem = useMutation(api.groceryList.remove);
  const clearChecked = useMutation(api.groceryList.clearChecked);
  
  const [newItem, setNewItem] = useState("");
  
  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await addItem({ name: newItem.trim() });
    setNewItem("");
  };
  
  const unchecked = items?.filter(i => !i.checked) || [];
  const checked = items?.filter(i => i.checked) || [];
  
  return (
    <div>
      {/* Add Item */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Add item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 bg-zinc-800 rounded-lg px-4 py-2"
        />
        <button onClick={handleAdd} className="bg-emerald-600 px-4 py-2 rounded-lg">
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      {/* Unchecked Items */}
      <div className="space-y-2 mb-6">
        {unchecked.map((item) => (
          <div key={item._id} className="flex items-center gap-3 bg-zinc-800 rounded-lg p-3">
            <button
              onClick={() => toggleItem({ id: item._id })}
              className="w-5 h-5 border-2 border-zinc-600 rounded"
            />
            <span className="flex-1">{item.name}</span>
            {item.quantity && <span className="text-zinc-400">{item.quantity}</span>}
            <button onClick={() => removeItem({ id: item._id })} className="text-zinc-500 hover:text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      
      {/* Checked Items */}
      {checked.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-500">Checked ({checked.length})</span>
            <button onClick={() => clearChecked()} className="text-sm text-red-400 hover:text-red-300">
              Clear all
            </button>
          </div>
          <div className="space-y-2 opacity-50">
            {checked.map((item) => (
              <div key={item._id} className="flex items-center gap-3 bg-zinc-800 rounded-lg p-3">
                <button
                  onClick={() => toggleItem({ id: item._id })}
                  className="w-5 h-5 bg-emerald-600 rounded flex items-center justify-center"
                >
                  <Check className="w-3 h-3" />
                </button>
                <span className="flex-1 line-through">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {items?.length === 0 && (
        <div className="text-zinc-500 text-center py-8">Grocery list is empty</div>
      )}
    </div>
  );
}
