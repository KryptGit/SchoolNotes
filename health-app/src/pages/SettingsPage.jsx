import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { read } from '../utils/storage';

export default function SettingsPage() {
  const { goals, setGoals, apiKey, setApiKey } = useApp();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ ...goals });
  const [keyInput, setKeyInput] = useState(apiKey);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = () => {
    setGoals({
      calories: Number(form.calories),
      protein_g: Number(form.protein_g),
      carbs_g: Number(form.carbs_g),
      fat_g: Number(form.fat_g),
      sleep_hours: Number(form.sleep_hours),
      target_bedtime: form.target_bedtime,
      target_wake: form.target_wake,
      weight_unit: form.weight_unit,
    });
    setApiKey(keyInput.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportData = () => {
    const data = {
      goals: read('ht_goals', {}),
      sleep: read('ht_sleep', []),
      nutrition: read('ht_nutrition', []),
      gym: read('ht_gym', []),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `healthtrack-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold pt-2">Settings</h1>

      <Section title="USDA Food API Key">
        <p className="text-xs text-slate-400 mb-2">
          Required for food search. Get a free key at <span className="text-sky-400">api.nal.usda.gov</span>
        </p>
        <input type="text" value={keyInput} onChange={(e) => setKeyInput(e.target.value)}
          placeholder="Paste your API key here"
          className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm font-mono" />
      </Section>

      <Section title="Sleep Goals">
        <Field label="Target sleep (hours)" value={form.sleep_hours} onChange={(v) => set('sleep_hours', v)} type="number" />
        <Field label="Target bedtime" value={form.target_bedtime} onChange={(v) => set('target_bedtime', v)} type="time" />
        <Field label="Target wake time" value={form.target_wake} onChange={(v) => set('target_wake', v)} type="time" />
      </Section>

      <Section title="Nutrition Goals (daily)">
        <Field label="Calories (kcal)" value={form.calories} onChange={(v) => set('calories', v)} type="number" />
        <Field label="Protein (g)" value={form.protein_g} onChange={(v) => set('protein_g', v)} type="number" />
        <Field label="Carbs (g)" value={form.carbs_g} onChange={(v) => set('carbs_g', v)} type="number" />
        <Field label="Fat (g)" value={form.fat_g} onChange={(v) => set('fat_g', v)} type="number" />
      </Section>

      <Section title="Gym">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Weight unit</label>
          <div className="flex gap-2">
            {['lbs', 'kg'].map((u) => (
              <button key={u} type="button" onClick={() => set('weight_unit', u)}
                className={`flex-1 py-2 rounded-xl text-sm transition-colors ${form.weight_unit === u ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {u}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <button onClick={save}
        className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl py-3 transition-colors">
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>

      <Section title="Data">
        <button onClick={exportData}
          className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-xl py-2.5 text-sm transition-colors">
          Export All Data (JSON)
        </button>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="text-xs text-slate-400 block mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
    </div>
  );
}
