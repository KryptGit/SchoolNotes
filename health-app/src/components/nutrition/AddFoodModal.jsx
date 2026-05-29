import { useState, useEffect, useRef } from 'react';
import { searchFoods, MICRO_LABELS } from '../../utils/usdaApi';
import { useApp } from '../../context/AppContext';

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];

const ZERO_NUTRIENTS = () => ({
  calories: '', protein_g: '', carbs_g: '', fat_g: '', fiber_g: '',
  calcium_mg: '', iron_mg: '', magnesium_mg: '', phosphorus_mg: '',
  potassium_mg: '', sodium_mg: '', zinc_mg: '',
  vitA_mcg: '', vitC_mg: '', vitD_mcg: '', vitE_mg: '', vitK_mcg: '',
  vitB1_mg: '', vitB2_mg: '', vitB3_mg: '', vitB6_mg: '', vitB12_mcg: '', folate_mcg: '',
});

export default function AddFoodModal({ onSave, onClose }) {
  const { apiKey } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selected, setSelected] = useState(null);
  const [meal, setMeal] = useState('breakfast');
  const [name, setName] = useState('');
  const [servingSize, setServingSize] = useState(100);
  const [nutrients, setNutrients] = useState(ZERO_NUTRIENTS());
  const [showMicros, setShowMicros] = useState(false);
  const debounce = useRef(null);

  const handleSearch = (q) => {
    setQuery(q);
    clearTimeout(debounce.current);
    if (!q.trim()) { setResults([]); return; }
    debounce.current = setTimeout(async () => {
      if (!apiKey) { setSearchError('Add your USDA API key in Settings first.'); return; }
      setSearching(true); setSearchError('');
      try {
        const foods = await searchFoods(q, apiKey);
        setResults(foods);
      } catch {
        setSearchError('Search failed. Check your API key or connection.');
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const selectFood = (food) => {
    setSelected(food);
    setName(food.name);
    setServingSize(food.servingSize ?? 100);
    const n = food.nutrients ?? {};
    setNutrients({
      calories: n.calories ?? '',
      protein_g: n.protein_g ?? '',
      carbs_g: n.carbs_g ?? '',
      fat_g: n.fat_g ?? '',
      fiber_g: n.fiber_g ?? '',
      calcium_mg: n.calcium_mg ?? '',
      iron_mg: n.iron_mg ?? '',
      magnesium_mg: n.magnesium_mg ?? '',
      phosphorus_mg: n.phosphorus_mg ?? '',
      potassium_mg: n.potassium_mg ?? '',
      sodium_mg: n.sodium_mg ?? '',
      zinc_mg: n.zinc_mg ?? '',
      vitA_mcg: n.vitA_mcg ?? '',
      vitC_mg: n.vitC_mg ?? '',
      vitD_mcg: n.vitD_mcg ?? '',
      vitE_mg: n.vitE_mg ?? '',
      vitK_mcg: n.vitK_mcg ?? '',
      vitB1_mg: n.vitB1_mg ?? '',
      vitB2_mg: n.vitB2_mg ?? '',
      vitB3_mg: n.vitB3_mg ?? '',
      vitB6_mg: n.vitB6_mg ?? '',
      vitB12_mcg: n.vitB12_mcg ?? '',
      folate_mcg: n.folate_mcg ?? '',
    });
    setResults([]);
    setQuery('');
  };

  const handleSave = () => {
    if (!name) return;
    onSave({
      meal,
      name,
      servingSize: Number(servingSize),
      fdcId: selected?.fdcId ?? null,
      ...Object.fromEntries(Object.entries(nutrients).map(([k, v]) => [k, v === '' ? 0 : Number(v)])),
    });
  };

  const macroFields = [
    { key: 'calories', label: 'Calories', unit: 'kcal' },
    { key: 'protein_g', label: 'Protein', unit: 'g' },
    { key: 'carbs_g', label: 'Carbs', unit: 'g' },
    { key: 'fat_g', label: 'Fat', unit: 'g' },
    { key: 'fiber_g', label: 'Fiber', unit: 'g' },
  ];

  return (
    <div className="space-y-4">
      {/* Food search */}
      <div className="relative">
        <input
          type="text"
          placeholder={apiKey ? 'Search food (e.g. "banana")' : 'Add USDA API key in Settings to search'}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm placeholder:text-slate-500"
        />
        {searching && <div className="text-xs text-slate-400 mt-1">Searching…</div>}
        {searchError && <div className="text-xs text-red-400 mt-1">{searchError}</div>}
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-slate-700 rounded-xl mt-1 z-10 max-h-48 overflow-y-auto shadow-xl">
            {results.map((f) => (
              <button key={f.fdcId} type="button" onClick={() => selectFood(f)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-600 transition-colors border-b border-slate-600/50 last:border-0">
                <div className="text-slate-100 truncate">{f.name}</div>
                {f.brandOwner && <div className="text-xs text-slate-400">{f.brandOwner}</div>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Manual name entry */}
      <div>
        <label className="text-xs text-slate-400 block mb-1">Food name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Or type manually"
          className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
      </div>

      {/* Meal slot */}
      <div className="flex gap-2">
        {MEALS.map((m) => (
          <button key={m} type="button" onClick={() => setMeal(m)}
            className={`flex-1 capitalize text-xs py-2 rounded-xl transition-colors ${meal === m ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            {m}
          </button>
        ))}
      </div>

      {/* Serving size */}
      <div>
        <label className="text-xs text-slate-400 block mb-1">Serving size (g)</label>
        <input type="number" value={servingSize} onChange={(e) => setServingSize(e.target.value)}
          className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
      </div>

      {/* Macros */}
      <div className="grid grid-cols-2 gap-2">
        {macroFields.map(({ key, label, unit }) => (
          <div key={key}>
            <label className="text-xs text-slate-400 block mb-1">{label} ({unit})</label>
            <input type="number" step="0.1" value={nutrients[key]}
              onChange={(e) => setNutrients((p) => ({ ...p, [key]: e.target.value }))}
              className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
          </div>
        ))}
      </div>

      {/* Micros toggle */}
      <button type="button" onClick={() => setShowMicros((v) => !v)}
        className="text-xs text-slate-400 underline">
        {showMicros ? 'Hide micronutrients' : 'Show micronutrients'}
      </button>

      {showMicros && (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(MICRO_LABELS).map(([key, label]) => (
            <div key={key}>
              <label className="text-xs text-slate-400 block mb-1">{label}</label>
              <input type="number" step="0.1" value={nutrients[key] ?? ''}
                onChange={(e) => setNutrients((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
            </div>
          ))}
        </div>
      )}

      <button onClick={handleSave} disabled={!name}
        className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl py-3 transition-colors">
        Add Food
      </button>
    </div>
  );
}
