export default function EmptyState({ icon, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <span className="text-5xl mb-3">{icon}</span>
      <p className="text-sm text-center">{message}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
