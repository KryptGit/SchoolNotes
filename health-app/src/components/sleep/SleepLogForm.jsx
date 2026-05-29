import { useState } from 'react';
import StarRating from '../shared/StarRating';
import { calcDurationHours, fmtHoursMin, today, toDateStr } from '../../utils/dateUtils';

const SLEEP_TAGS = ['Stress', 'Caffeine', 'Late Screen', 'Alcohol', 'Exercise', 'Nap', 'Noise', 'Heat'];

export default function SleepLogForm({ existing, onSave }) {
  const now = new Date();
  const defaultWake = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const prev = new Date(now); prev.setHours(now.getHours() - 8);
  const defaultBed = `${String(prev.getHours()).padStart(2,'0')}:${String(prev.getMinutes()).padStart(2,'0')}`;

  const [bedTime, setBedTime]   = useState(existing ? existing.bedtime?.slice(11,16) : defaultBed);
  const [wakeTime, setWakeTime] = useState(existing ? existing.wakeTime?.slice(11,16) : defaultWake);
  const [bedDate, setBedDate]   = useState(existing ? existing.bedtime?.slice(0,10) : (() => { const d = new Date(); d.setDate(d.getDate()-1); return toDateStr(d); })());
  const [quality, setQuality]   = useState(existing?.quality ?? 3);
  const [tags, setTags]         = useState(existing?.tags ?? []);
  const [notes, setNotes]       = useState(existing?.notes ?? '');

  const bedISO  = bedTime  ? new Date(`${bedDate}T${bedTime}:00`).toISOString()  : null;
  const wakeISO = wakeTime ? new Date(`${today()}T${wakeTime}:00`).toISOString() : null;
  const duration = (bedISO && wakeISO) ? calcDurationHours(bedISO, wakeISO) : null;

  const toggleTag = (t) => setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const handleSave = () => {
    if (!bedISO || !wakeISO || duration <= 0) return;
    onSave({ date: today(), bedtime: bedISO, wakeTime: wakeISO, durationHours: duration, quality, tags, notes });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Bed date</label>
          <input type="date" value={bedDate} onChange={(e) => setBedDate(e.target.value)}
            className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Bedtime</label>
          <input type="time" value={bedTime} onChange={(e) => setBedTime(e.target.value)}
            className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Wake date (today)</label>
          <input type="date" value={today()} disabled
            className="w-full bg-slate-700/50 text-slate-400 rounded-xl px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Wake time</label>
          <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)}
            className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
        </div>
      </div>

      {duration !== null && duration > 0 && (
        <div className="bg-indigo-800/30 rounded-xl px-4 py-3 text-center">
          <span className="text-2xl font-bold text-indigo-300">{fmtHoursMin(duration)}</span>
          <span className="text-slate-400 text-sm ml-2">of sleep</span>
        </div>
      )}

      <div>
        <label className="text-xs text-slate-400 block mb-2">Sleep quality</label>
        <StarRating value={quality} onChange={setQuality} />
      </div>

      <div>
        <label className="text-xs text-slate-400 block mb-2">Factors (optional)</label>
        <div className="flex flex-wrap gap-2">
          {SLEEP_TAGS.map((t) => (
            <button key={t} type="button" onClick={() => toggleTag(t)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${tags.includes(t) ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 block mb-1">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
          placeholder="How did you feel?"
          className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm resize-none" />
      </div>

      <button onClick={handleSave} disabled={!duration || duration <= 0}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl py-3 transition-colors">
        Save Sleep
      </button>
    </div>
  );
}
