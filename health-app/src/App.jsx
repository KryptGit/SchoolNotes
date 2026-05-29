import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import TodayPage from './pages/TodayPage';
import SleepPage from './pages/SleepPage';
import NutritionPage from './pages/NutritionPage';
import GymPage from './pages/GymPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/today" replace />} />
        <Route path="today" element={<TodayPage />} />
        <Route path="sleep" element={<SleepPage />} />
        <Route path="nutrition" element={<NutritionPage />} />
        <Route path="gym" element={<GymPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
