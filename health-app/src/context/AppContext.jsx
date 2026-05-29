import { createContext, useContext, useState, useCallback } from 'react';
import { read, write } from '../utils/storage';

const AppContext = createContext(null);

const DEFAULT_GOALS = {
  calories: 2000,
  protein_g: 150,
  carbs_g: 200,
  fat_g: 65,
  sleep_hours: 8,
  target_bedtime: '23:00',
  target_wake: '07:00',
  weight_unit: 'lbs',
};

export const AppProvider = ({ children }) => {
  const [goals, setGoalsState] = useState(() => ({
    ...DEFAULT_GOALS,
    ...read('ht_goals', {}),
  }));
  const [apiKey, setApiKeyState] = useState(() => read('ht_api_key', ''));

  const setGoals = useCallback((updates) => {
    setGoalsState((prev) => {
      const next = { ...prev, ...updates };
      write('ht_goals', next);
      return next;
    });
  }, []);

  const setApiKey = useCallback((key) => {
    setApiKeyState(key);
    write('ht_api_key', key);
  }, []);

  return (
    <AppContext.Provider value={{ goals, setGoals, apiKey, setApiKey }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
