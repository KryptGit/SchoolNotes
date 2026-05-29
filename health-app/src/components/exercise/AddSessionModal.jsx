import { useState } from 'react';
import { useGymLog } from '../../hooks/useGymLog';
import { getWeightRecommendation } from '../../utils/gymEngine';
import { useApp } from '../../context/AppContext';
import Modal from '../shared/Modal';
import ExercisePicker from './ExercisePicker';

const emptySet = (unit) => ({ reps: '', weight: '', unit });

export default function AddSessionModal({ onSave, onClose }) {
  const { goals } = useApp();
  const { sessions } = useGymLog();
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const unit = goals.weight_unit ?? 'lbs';

  const addExercise = (ex) => {
    setExercises((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: ex?.name ?? '',
        muscles: ex?.muscles ?? [],
        targetRepMin: 8,
        targetRepMax: 12,
        sets: [emptySet(unit)],
        presetId: ex?.id ?? null,
      },
    ]);
    setShowPicker(false);
  };

  const updateExercise = (idx, updates) =>
    setExercises((prev) => prev.map((e, i) => (i === idx ? { ...e, ...updates } : e)));

  const addSet = (idx) =>
    setExercises((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, sets: [...e.sets, emptySet(unit)] } : e))
    );

  const updateSet = (exIdx, setIdx, updates) =>
    setExercises((prev) =>
      prev.map((e, i) =>
        i !== exIdx ? e : { ...e, sets: e.sets.map((s, j) => (j === setIdx ? { ...s, ...updates } : s)) }
      )
    );

  const removeSet = (exIdx, setIdx) =>
    setExercises((prev) =>
      prev.map((e, i) =>
        i !== exIdx ? e : { ...e, sets: e.sets.filter((_, j) => j !== setIdx) }
      )
    );

  const removeExercise = (idx) =>
    setExercises((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    if (!name) return;
    onSave({
      name,
      exercises: exercises.map(({ id, muscles, presetId, ...rest }) => rest),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-slate-400 block mb-1">Session name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Push Day, Leg Day"
          className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
      </div>

      {exercises.map((ex, exIdx) => {
        const rec = getWeightRecommendation(ex.name, sessions, ex.targetRepMin);
        return (
          <div key={ex.id} className="bg-slate-700/50 rounded-xl p-3 space-y-3">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <input type="text" value={ex.name} onChange={(e) => updateExercise(exIdx, { name: e.target.value })}
                  placeholder="Exercise name"
                  className="w-full bg-slate-700 text-slate-100 rounded-lg px-2 py-1.5 text-sm" />
                {ex.muscles.length > 0 && (
                  <div className="text-xs text-sky-400 mt-1">{ex.muscles.join(', ')}</div>
                )}
              </div>
              <button onClick={() => removeExercise(exIdx)} className="text-slate-500 hover:text-red-400 text-lg mt-0.5">×</button>
            </div>

            {rec && (
              <div className="text-xs text-sky-300 bg-sky-900/30 rounded-lg px-2 py-1.5">
                💡 {rec.message}
              </div>
            )}

            <div className="flex gap-2 items-center">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Target reps</label>
                <div className="flex items-center gap-1">
                  <input type="number" value={ex.targetRepMin}
                    onChange={(e) => updateExercise(exIdx, { targetRepMin: Number(e.target.value) })}
                    className="w-12 bg-slate-700 text-slate-100 rounded-lg px-2 py-1 text-xs text-center" />
                  <span className="text-slate-500 text-xs">–</span>
                  <input type="number" value={ex.targetRepMax}
                    onChange={(e) => updateExercise(exIdx, { targetRepMax: Number(e.target.value) })}
                    className="w-12 bg-slate-700 text-slate-100 rounded-lg px-2 py-1 text-xs text-center" />
                </div>
              </div>
            </div>

            {/* Sets */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 px-1">
                <span>Set</span><span>Reps</span><span>Weight ({unit})</span>
              </div>
              {ex.sets.map((s, sIdx) => (
                <div key={sIdx} className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-xs text-slate-400 text-center">{sIdx + 1}</span>
                  <input type="number" placeholder="8" value={s.reps}
                    onChange={(e) => updateSet(exIdx, sIdx, { reps: e.target.value })}
                    className="bg-slate-700 text-slate-100 rounded-lg px-2 py-1.5 text-sm text-center" />
                  <div className="flex gap-1">
                    <input type="number" placeholder={rec?.recommendedWeight ?? '135'} value={s.weight}
                      onChange={(e) => updateSet(exIdx, sIdx, { weight: e.target.value })}
                      className="flex-1 bg-slate-700 text-slate-100 rounded-lg px-2 py-1.5 text-sm text-center" />
                    <button onClick={() => removeSet(exIdx, sIdx)}
                      className="text-slate-600 hover:text-red-400 text-sm px-1">×</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => addSet(exIdx)}
                className="text-xs text-sky-400 hover:text-sky-300 transition-colors">
                + Add Set
              </button>
            </div>
          </div>
        );
      })}

      <button type="button" onClick={() => setShowPicker(true)}
        className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-xl py-2.5 transition-colors">
        + Add Exercise
      </button>

      <button onClick={handleSave} disabled={!name}
        className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl py-3 transition-colors">
        Save Session
      </button>

      {showPicker && (
        <Modal title="Choose Exercise" onClose={() => setShowPicker(false)}>
          <ExercisePicker onSelect={addExercise} onClose={() => setShowPicker(false)} />
        </Modal>
      )}
    </div>
  );
}
