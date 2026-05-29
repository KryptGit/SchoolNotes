import { useState } from 'react';
import { useNutritionLog } from '../hooks/useNutritionLog';
import { useApp } from '../context/AppContext';
import ProgressBar from '../components/shared/ProgressBar';
import Modal from '../components/shared/Modal';
import AddFoodModal from '../components/nutrition/AddFoodModal';
import MicroGrid from '../components/nutrition/MicroGrid';
import EmptyState from '../components/shared/EmptyState';

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };

export default function NutritionPage() {
  const { goals } = useApp();
  const { addEntry, deleteEntry, getTodayEntries, getTodayTotals } = useNutritionLog();
  const [showAdd, setShowAdd] = useState(false);
  const [showMicros, setShowMicros] = useState(false);

  const todayEntries = getTodayEntries();
  const totals = getTodayTotals();

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold">Nutrition</h1>
        <button onClick={() => setShowAdd(true)}
          className="bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          + Add Food
        </button>
      </div>

      {/* Calorie summary */}
      <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-slate-400 text-sm">Calories</span>
          <span className="text-slate-400 text-xs">{totals.calories} / {goals.calories} kcal</span>
        </div>
        <ProgressBar value={totals.calories} max={goals.calories} color="bg-orange-500" />

        <div className="grid grid-cols-3 gap-3 pt-1">
          <MacroBar label="Protein" value={totals.protein_g} max={goals.protein_g} color="bg-blue-500" unit="g" />
          <MacroBar label="Carbs"   value={totals.carbs_g}   max={goals.carbs_g}   color="bg-yellow-500" unit="g" />
          <MacroBar label="Fat"     value={totals.fat_g}     max={goals.fat_g}     color="bg-rose-500" unit="g" />
        </div>
      </div>

      {/* Meal entries */}
      {todayEntries.length === 0 ? (
        <EmptyState icon="🥗" message="No meals logged today. Tap + Add Food to start tracking." />
      ) : (
        MEALS.map((meal) => {
          const entries = todayEntries.filter((e) => e.meal === meal);
          if (!entries.length) return null;
          return (
            <div key={meal} className="bg-slate-800 rounded-2xl p-4">
              <h3 className="text-sm font-medium text-slate-300 capitalize mb-2 flex items-center gap-2">
                {MEAL_ICONS[meal]} {meal}
              </h3>
              <div className="space-y-2">
                {entries.map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-200 truncate">{e.name}</div>
                      <div className="text-xs text-slate-500">
                        {e.servingSize}g · P:{e.protein_g}g · C:{e.carbs_g}g · F:{e.fat_g}g
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-orange-300 font-medium">{e.calories} kcal</span>
                      <button onClick={() => deleteEntry(e.id)} className="text-slate-600 hover:text-red-400 text-xs">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Micronutrients toggle */}
      {todayEntries.length > 0 && (
        <button onClick={() => setShowMicros((v) => !v)}
          className="w-full bg-slate-800 hover:bg-slate-700 rounded-2xl p-3 text-sm text-slate-400 transition-colors">
          {showMicros ? '▲ Hide Micronutrients' : '▼ Show Micronutrients'}
        </button>
      )}
      {showMicros && <MicroGrid totals={totals} />}

      {showAdd && (
        <Modal title="Add Food" onClose={() => setShowAdd(false)}>
          <AddFoodModal
            onSave={(entry) => { addEntry(entry); setShowAdd(false); }}
            onClose={() => setShowAdd(false)}
          />
        </Modal>
      )}
    </div>
  );
}

function MacroBar({ label, value, max, color, unit }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="text-center">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-1">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-slate-300">{value}{unit}</div>
      <div className="text-xs text-slate-500">/{max}{unit}</div>
    </div>
  );
}
