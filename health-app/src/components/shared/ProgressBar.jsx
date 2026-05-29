export default function ProgressBar({ value, max, color = 'bg-green-500', label, sublabel, className = '' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const over = value > max && max > 0;
  return (
    <div className={className}>
      {(label || sublabel) && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-300">{label}</span>
          <span className={over ? 'text-red-400' : 'text-slate-400'}>{sublabel}</span>
        </div>
      )}
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
