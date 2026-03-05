import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DeviceList from './pages/DeviceList';
import DeviceForm from './pages/DeviceForm';
import DeviceSearch from './pages/DeviceSearch';
import ReportForm from './pages/ReportForm';
import RecursosPos from './pages/RecursosPos';
import './App.css';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar theme={theme} onToggleTheme={toggleTheme} />
        <main className="app-main">
          <div className="app-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/devices" element={<DeviceList />} />
              <Route path="/devices/new" element={<DeviceForm />} />
              <Route path="/devices/:id" element={<DeviceForm />} />
              <Route path="/devices/:id/edit" element={<DeviceForm />} />
              <Route path="/search" element={<DeviceSearch />} />
              <Route path="/report/new" element={<ReportForm />} />
              <Route path="/recursos-pos" element={<RecursosPos />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
