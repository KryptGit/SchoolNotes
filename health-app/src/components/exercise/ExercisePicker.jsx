import { useState } from 'react';
import { EXERCISES } from '../../data/exercises';

export default function ExercisePicker({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const filtered = query.trim()
    ? EXERCISES.filter(
        (e) =>
          e.name.toLowerCase().includes(query.toLowerCase()) ||
          e.muscles.some((m) => m.toLowerCase().includes(query.toLowerCase()))
      )
    : EXERCISES;

  return (
    <div className="space-y-3">
      <input
        autoFocus
        type="text"
        placeholder="Search exercises or muscle group…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm"
      />
      <div className="space-y-1 max-h-72 overflow-y-auto">
        {filtered.map((ex) => (
          <button
            key={ex.id}
            type="button"
            onClick={() => onSelect(ex)}
            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-600 transition-colors"
          >
            <div className="text-sm text-slate-100">{ex.name}</div>
            <div className="text-xs text-slate-400 mt-0.5">
              <span className="text-sky-400">{ex.muscles.join(', ')}</span>
              {ex.secondary.length > 0 && <span className="text-slate-500"> · {ex.secondary.join(', ')}</span>}
              <span className="ml-2 text-slate-600">{ex.equipment}</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-4">
            No match — you can still type a custom name in the session.
          </div>
        )}
      </div>
    </div>
  );
}
