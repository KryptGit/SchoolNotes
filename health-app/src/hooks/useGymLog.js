import { useState, useCallback } from 'react';
import { read, write } from '../utils/storage';
import { uid } from '../utils/uuid';
import { today } from '../utils/dateUtils';

const KEY = 'ht_gym';

const load = () => read(KEY, []);
const save = (sessions) => write(KEY, sessions);

export const useGymLog = () => {
  const [sessions, setSessions] = useState(load);

  const addSession = useCallback((session) => {
    setSessions((prev) => {
      const next = [
        ...prev,
        { id: uid(), date: today(), loggedAt: new Date().toISOString(), ...session },
      ];
      save(next);
      return next;
    });
  }, []);

  const deleteSession = useCallback((id) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      save(next);
      return next;
    });
  }, []);

  const getTodaySessions = () => sessions.filter((s) => s.date === today());

  const getRecentSessions = (n = 10) =>
    [...sessions].sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt)).slice(0, n);

  return { sessions, addSession, deleteSession, getTodaySessions, getRecentSessions };
};
