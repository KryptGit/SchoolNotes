import { useState } from 'react';
import { useSleepLog } from '../hooks/useSleepLog';
import { useApp } from '../context/AppContext';
import { computeSleepRecommendation } from '../utils/sleepEngine';
import { fmtHoursMin, fmtTime, fmtShortDate } from '../utils/dateUtils';
import SleepRecommendationCard from '../components/sleep/SleepRecommendationCard';
import SleepLogForm from '../components/sleep/SleepLogForm';
import SleepTrendChart from '../components/sleep/SleepTrendChart';
import Modal from '../components/shared/Modal';

export default function SleepPage() {
  const { goals } = useApp();
  const { entries, logSleep, deleteSleep, getTodayEntry, getWeekEntries, getDebt, getConsistency } = useSleepLog();
  const [showLog, setShowLog] = useState(false);

  const todayEntry = getTodayEntry();
  const weekEntries = getWeekEntries();
  const debt = getDebt(goals.sleep_hours);
  const consistency = getConsistency(goals.target_bedtime);
  const rec = computeSleepRecommendation(entries, goals);

  const recent = [...entries]
    .sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt))
    .slice(0, 7);

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold">Sleep</h1>
        <button onClick={() => setShowLog(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          + Log Sleep
        </button>
      </div>

      <SleepRecommendationCard rec={rec} />

      {/* Today's entry summary */}
      {todayEntry ? (
        <div className="bg-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 mb-0.5">Last night</div>
            <div className="text-2xl font-bold text-indigo-300">{fmtHoursMin(todayEntry.durationHours)}</div>
            <div className="text-xs text-slate-400 mt-0.5">
              {fmtTime(todayEntry.bedtime)} → {fmtTime(todayEntry.wakeTime)}
            </div>
            {todayEntry.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {todayEntry.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-slate-300">{t}</span>
                ))}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl">{'★'.repeat(todayEntry.quality)}{'☆'.repeat(5 - todayEntry.quality)}</div>
            <button onClick={() => deleteSleep(todayEntry.id)} className="text-xs text-slate-500 hover:text-red-400 mt-2">Delete</button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-2xl p-4 text-center text-slate-400 text-sm">
          No sleep logged today. Tap "+ Log Sleep" to add.
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="7-day avg" value={rec.avgHours ? `${rec.avgHours}h` : '—'} />
        <StatCard label="Sleep debt" value={debt > 0 ? `${Math.round(debt * 10) / 10}h` : '0h'} warn={debt > 2} />
        <StatCard label="Consistency" value={consistency !== null ? `${consistency}%` : '—'} />
      </div>

      <SleepTrendChart weekEntries={weekEntries} goalHours={goals.sleep_hours} />

      {/* Recent history */}
      {recent.length > 1 && (
        <div className="bg-slate-800 rounded-2xl p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Recent</h3>
          <div className="space-y-2">
            {recent.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-slate-300">{fmtShortDate(e.date)}</span>
                  {e.tags?.length > 0 && (
                    <span className="ml-2 text-xs text-slate-500">{e.tags.slice(0,2).join(', ')}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-indigo-300 font-medium">{fmtHoursMin(e.durationHours)}</span>
                  <span className="text-yellow-400 text-xs">{'★'.repeat(e.quality)}</span>
                  <button onClick={() => deleteSleep(e.id)} className="text-slate-600 hover:text-red-400 text-xs">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showLog && (
        <Modal title="Log Sleep" onClose={() => setShowLog(false)}>
          <SleepLogForm
            existing={todayEntry}
            onSave={(entry) => { logSleep(entry); setShowLog(false); }}
          />
        </Modal>
      )}
    </div>
  );
}

function StatCard({ label, value, warn }) {
  return (
    <div className="bg-slate-800 rounded-xl p-3 text-center">
      <div className={`text-lg font-bold ${warn ? 'text-orange-400' : 'text-slate-100'}`}>{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
