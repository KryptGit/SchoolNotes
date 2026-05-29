import { useState, useCallback } from 'react';
import { read, write } from '../utils/storage';
import { uid } from '../utils/uuid';
import { today } from '../utils/dateUtils';

const KEY = 'ht_nutrition';

const load = () => read(KEY, []);
const save = (entries) => write(KEY, entries);

export const useNutritionLog = () => {
  const [entries, setEntries] = useState(load);

  const addEntry = useCallback((entry) => {
    setEntries((prev) => {
      const next = [
        ...prev,
        { id: uid(), date: today(), loggedAt: new Date().toISOString(), ...entry },
      ];
      save(next);
      return next;
    });
  }, []);

  const deleteEntry = useCallback((id) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      save(next);
      return next;
    });
  }, []);

  const getTodayEntries = () => entries.filter((e) => e.date === today());

  const getTodayTotals = () => {
    const todays = getTodayEntries();
    const sum = (key) => todays.reduce((s, e) => s + (e[key] ?? 0), 0);
    return {
      calories: Math.round(sum('calories')),
      protein_g: Math.round(sum('protein_g') * 10) / 10,
      carbs_g: Math.round(sum('carbs_g') * 10) / 10,
      fat_g: Math.round(sum('fat_g') * 10) / 10,
      fiber_g: Math.round(sum('fiber_g') * 10) / 10,
      calcium_mg: Math.round(sum('calcium_mg') * 10) / 10,
      iron_mg: Math.round(sum('iron_mg') * 10) / 10,
      magnesium_mg: Math.round(sum('magnesium_mg') * 10) / 10,
      phosphorus_mg: Math.round(sum('phosphorus_mg') * 10) / 10,
      potassium_mg: Math.round(sum('potassium_mg') * 10) / 10,
      sodium_mg: Math.round(sum('sodium_mg') * 10) / 10,
      zinc_mg: Math.round(sum('zinc_mg') * 10) / 10,
      vitA_mcg: Math.round(sum('vitA_mcg') * 10) / 10,
      vitC_mg: Math.round(sum('vitC_mg') * 10) / 10,
      vitD_mcg: Math.round(sum('vitD_mcg') * 10) / 10,
      vitE_mg: Math.round(sum('vitE_mg') * 10) / 10,
      vitK_mcg: Math.round(sum('vitK_mcg') * 10) / 10,
      vitB1_mg: Math.round(sum('vitB1_mg') * 10) / 10,
      vitB2_mg: Math.round(sum('vitB2_mg') * 10) / 10,
      vitB3_mg: Math.round(sum('vitB3_mg') * 10) / 10,
      vitB6_mg: Math.round(sum('vitB6_mg') * 10) / 10,
      vitB12_mcg: Math.round(sum('vitB12_mcg') * 10) / 10,
      folate_mcg: Math.round(sum('folate_mcg') * 10) / 10,
    };
  };

  return { entries, addEntry, deleteEntry, getTodayEntries, getTodayTotals };
};
