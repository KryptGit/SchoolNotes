import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/today',     label: 'Today',     icon: '🏠' },
  { to: '/sleep',     label: 'Sleep',     icon: '🌙' },
  { to: '/nutrition', label: 'Nutrition', icon: '🥗' },
  { to: '/gym',       label: 'Gym',       icon: '💪' },
  { to: '/settings',  label: 'Settings',  icon: '⚙️' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 safe-bottom z-50">
      <div className="flex">
        {tabs.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                isActive ? 'text-green-400' : 'text-slate-400'
              }`
            }
          >
            <span className="text-lg leading-none">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
