import { fmtDayLabel, fmtHoursMin } from '../../utils/dateUtils';

export default function SleepTrendChart({ weekEntries, goalHours }) {
  const maxH = Math.max(goalHours * 1.25, ...weekEntries.map((d) => d.entry?.durationHours ?? 0), 9);

  return (
    <div className="bg-slate-800 rounded-2xl p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-4">7-Day Sleep</h3>
      <div className="flex items-end gap-1 h-28">
        {weekEntries.map(({ date, entry }) => {
          const h = entry?.durationHours ?? 0;
          const pct = (h / maxH) * 100;
          const goalPct = (goalHours / maxH) * 100;
          const under = h > 0 && h < goalHours;
          return (
            <div key={date} className="flex-1 flex flex-col items-center gap-1 relative h-full">
              {/* goal line marker */}
              <div className="absolute w-full border-t border-dashed border-green-600/40"
                style={{ bottom: `${goalPct}%` }} />
              <div className="w-full flex flex-col justify-end h-full">
                <div
                  className={`w-full rounded-t transition-all ${h === 0 ? 'bg-slate-700' : under ? 'bg-orange-500/70' : 'bg-indigo-500/80'}`}
                  style={{ height: h > 0 ? `${pct}%` : '4px' }}
                  title={h > 0 ? fmtHoursMin(h) : 'No data'}
                />
              </div>
              <span className="text-[10px] text-slate-500">{fmtDayLabel(date)}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
        <span className="w-3 h-0.5 border-t border-dashed border-green-600 inline-block" />
        <span>Goal: {goalHours}h</span>
        <span className="ml-2 w-2 h-2 rounded-sm bg-orange-500/70 inline-block" />
        <span>Under goal</span>
      </div>
    </div>
  );
}
