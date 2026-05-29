import { useState } from 'react';
import { useGymLog } from '../hooks/useGymLog';
import Modal from '../components/shared/Modal';
import AddSessionModal from '../components/exercise/AddSessionModal';
import EmptyState from '../components/shared/EmptyState';
import { fmtShortDate } from '../utils/dateUtils';

export default function GymPage() {
  const { sessions, addSession, deleteSession, getRecentSessions } = useGymLog();
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const recent = getRecentSessions(20);

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold">Gym</h1>
        <button onClick={() => setShowAdd(true)}
          className="bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          + Log Session
        </button>
      </div>

      {recent.length === 0 ? (
        <EmptyState icon="💪" message="No sessions logged yet. Add your first workout!" />
      ) : (
        <div className="space-y-3">
          {recent.map((session) => (
            <div key={session.id} className="bg-slate-800 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setExpanded(expanded === session.id ? null : session.id)}
                className="w-full text-left px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-slate-100">{session.name}</div>
                  <div className="text-xs text-slate-400">{fmtShortDate(session.date)} · {session.exercises?.length ?? 0} exercise{session.exercises?.length !== 1 ? 's' : ''}</div>
                </div>
                <span className="text-slate-500 text-sm">{expanded === session.id ? '▲' : '▼'}</span>
              </button>

              {expanded === session.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-700">
                  {session.exercises?.map((ex, i) => (
                    <div key={i} className="pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-slate-200">{ex.name}</span>
                        {ex.targetRepMin && (
                          <span className="text-xs text-slate-500">({ex.targetRepMin}–{ex.targetRepMax} reps)</span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 mb-1">
                        <span>Set</span><span>Reps</span><span>Weight</span>
                      </div>
                      {ex.sets?.map((s, j) => (
                        <div key={j} className="grid grid-cols-3 gap-2 text-sm text-slate-300">
                          <span>{j + 1}</span>
                          <span>{s.reps}</span>
                          <span>{s.weight} {s.unit}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  <button onClick={() => deleteSession(session.id)}
                    className="text-xs text-slate-500 hover:text-red-400 transition-colors mt-2">
                    Delete session
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Log Workout" onClose={() => setShowAdd(false)}>
          <AddSessionModal
            onSave={(s) => { addSession(s); setShowAdd(false); }}
            onClose={() => setShowAdd(false)}
          />
        </Modal>
      )}
    </div>
  );
}
