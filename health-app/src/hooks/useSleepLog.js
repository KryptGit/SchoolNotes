import { useState, useCallback } from 'react';
import { read, write } from '../utils/storage';
import { uid } from '../utils/uuid';
import { today, toDateStr, getWeekDates } from '../utils/dateUtils';

const KEY = 'ht_sleep';

const load = () => read(KEY, []);
const save = (entries) => write(KEY, entries);

export const useSleepLog = () => {
  const [entries, setEntries] = useState(load);

  const logSleep = useCallback((entry) => {
    setEntries((prev) => {
      const next = [
        ...prev.filter((e) => e.date !== entry.date),
        { id: uid(), loggedAt: new Date().toISOString(), ...entry },
      ];
      save(next);
      return next;
    });
  }, []);

  const deleteSleep = useCallback((id) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      save(next);
      return next;
    });
  }, []);

  const getTodayEntry = () => entries.find((e) => e.date === today()) ?? null;

  const getWeekEntries = () => {
    const dates = getWeekDates(7);
    return dates.map((d) => ({
      date: d,
      entry: entries.find((e) => e.date === d) ?? null,
    }));
  };

  const getDebt = (goalHours) => {
    const dates = getWeekDates(7);
    return dates.reduce((sum, d) => {
      const e = entries.find((en) => en.date === d);
      return sum + Math.max(0, goalHours - (e?.durationHours ?? 0));
    }, 0);
  };

  const getConsistency = (targetBedtime) => {
    if (!targetBedtime) return null;
    const [th, tm] = targetBedtime.split(':').map(Number);
    const targetMin = th * 60 + tm;
    const window = 30;
    const dates = getWeekDates(7);
    let onTime = 0, logged = 0;
    for (const d of dates) {
      const e = entries.find((en) => en.date === d);
      if (!e?.bedtime) continue;
      logged++;
      const bed = new Date(e.bedtime);
      const bedMin = bed.getHours() * 60 + bed.getMinutes();
      let diff = Math.abs(bedMin - targetMin);
      if (diff > 720) diff = 1440 - diff;
      if (diff <= window) onTime++;
    }
    return logged === 0 ? null : Math.round((onTime / logged) * 100);
  };

  return { entries, logSleep, deleteSleep, getTodayEntry, getWeekEntries, getDebt, getConsistency };
};
