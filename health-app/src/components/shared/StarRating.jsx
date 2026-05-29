export default function StarRating({ value, onChange, max = 5 }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition-colors ${star <= value ? 'text-yellow-400' : 'text-slate-600'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
