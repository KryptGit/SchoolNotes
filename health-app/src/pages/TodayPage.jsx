import { Link } from 'react-router-dom';
import { useSleepLog } from '../hooks/useSleepLog';
import { useNutritionLog } from '../hooks/useNutritionLog';
import { useGymLog } from '../hooks/useGymLog';
import { useApp } from '../context/AppContext';
import { fmtHoursMin, fmtShortDate, today } from '../utils/dateUtils';

export default function TodayPage() {
  const { goals } = useApp();
  const { getTodayEntry } = useSleepLog();
  const { getTodayTotals, getTodayEntries } = useNutritionLog();
  const { getTodaySessions } = useGymLog();

  const sleepEntry   = getTodayEntry();
  const nutritionTot = getTodayTotals();
  const nutritionEntries = getTodayEntries();
  const gymSessions  = getTodaySessions();

  const calPct  = goals.calories > 0 ? Math.min(100, (nutritionTot.calories / goals.calories) * 100) : 0;
  const sleepPct = goals.sleep_hours > 0 && sleepEntry
    ? Math.min(100, (sleepEntry.durationHours / goals.sleep_hours) * 100) : 0;

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      <div className="pt-2">
        <h1 className="text-xl font-bold">Today</h1>
        <p className="text-sm text-slate-400">{fmtShortDate(today())}</p>
      </div>

      {/* Sleep card */}
      <Link to="/sleep">
        <div className="bg-slate-800 rounded-2xl p-4 hover:bg-slate-750 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌙</span>
              <span className="font-medium">Sleep</span>
            </div>
            <span className="text-xs text-slate-500">▶</span>
          </div>
          {sleepEntry ? (
            <>
              <div className="text-2xl font-bold text-indigo-300 mb-1">{fmtHoursMin(sleepEntry.durationHours)}</div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${sleepPct}%` }} />
              </div>
              <div className="text-xs text-slate-400 mt-1">Goal: {goals.sleep_hours}h · Quality: {'★'.repeat(sleepEntry.quality)}</div>
            </>
          ) : (
            <p className="text-sm text-slate-400">No sleep logged — tap to add.</p>
          )}
        </div>
      </Link>

      {/* Nutrition card */}
      <Link to="/nutrition">
        <div className="bg-slate-800 rounded-2xl p-4 hover:bg-slate-750 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🥗</span>
              <span className="font-medium">Nutrition</span>
            </div>
            <span className="text-xs text-slate-500">▶</span>
          </div>
          {nutritionEntries.length > 0 ? (
            <>
              <div className="text-2xl font-bold text-orange-300 mb-1">{nutritionTot.calories} <span className="text-base font-normal text-slate-400">/ {goals.calories} kcal</span></div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${calPct}%` }} />
              </div>
              <div className="text-xs text-slate-400 mt-1">
                P:{nutritionTot.protein_g}g · C:{nutritionTot.carbs_g}g · F:{nutritionTot.fat_g}g
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400">No meals logged — tap to add.</p>
          )}
        </div>
      </Link>

      {/* Gym card */}
      <Link to="/gym">
        <div className="bg-slate-800 rounded-2xl p-4 hover:bg-slate-750 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">💪</span>
              <span className="font-medium">Gym</span>
            </div>
            <span className="text-xs text-slate-500">▶</span>
          </div>
          {gymSessions.length > 0 ? (
            <>
              <div className="text-2xl font-bold text-sky-300 mb-1">
                {gymSessions.length} session{gymSessions.length !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-slate-400">
                {gymSessions.map((s) => s.name).join(' · ')}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400">No workouts today — tap to add.</p>
          )}
        </div>
      </Link>
    </div>
  );
}
