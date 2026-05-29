export default function SleepRecommendationCard({ rec }) {
  if (!rec) return null;
  const hasData = rec.tonightBedtime;

  return (
    <div className="bg-indigo-900/40 border border-indigo-700/50 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">🌙</span>
        <h2 className="font-semibold text-indigo-300">Tonight's Recommendation</h2>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{rec.message}</p>
      {hasData && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Chip label="Sleep by" value={rec.tonightBedtime} color="indigo" />
          <Chip label="Wake at" value={rec.wakeAnchor} color="green" />
          <Chip label="Don't stay up past" value={rec.doNotSleepPast} color="red" />
          {rec.napCutoff && <Chip label="No naps after" value={rec.napCutoff} color="yellow" />}
        </div>
      )}
      {rec.recoveryDays > 0 && (
        <p className="text-xs text-slate-400">Estimated recovery: ~{rec.recoveryDays} night{rec.recoveryDays !== 1 ? 's' : ''}</p>
      )}
    </div>
  );
}

const colors = {
  indigo: 'bg-indigo-800/60 text-indigo-200',
  green:  'bg-green-800/60 text-green-200',
  red:    'bg-red-800/60 text-red-200',
  yellow: 'bg-yellow-800/60 text-yellow-200',
};

function Chip({ label, value, color }) {
  return (
    <div className={`rounded-xl p-2 text-center ${colors[color] ?? colors.indigo}`}>
      <div className="text-xs opacity-70">{label}</div>
      <div className="font-semibold text-sm">{value}</div>
    </div>
  );
}
