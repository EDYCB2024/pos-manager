import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DeviceList from './pages/DeviceList';
import DeviceForm from './pages/DeviceForm';
import DeviceSearch from './pages/DeviceSearch';
import ReportForm from './pages/ReportForm';
import RecursosPos from './pages/RecursosPos';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Activate from './pages/Activate';
import Welcome from './pages/Welcome';
import AtcInbox from './pages/AtcInbox';
import QuotationForm from './pages/QuotationForm';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import CR7Bot from './components/CR7Bot';
import { Outlet } from 'react-router-dom';
import './App.css';

function ProtectedLayout({ theme, toggleTheme }) {
  return (
    <div className="app-shell">
      <Sidebar theme={theme} onToggleTheme={toggleTheme} />
      <main className="app-main">
        <Navbar />
        <div className="app-content">
          <Outlet />
        </div>
        <CR7Bot />
      </main>
    </div>
  );
}

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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/activate" element={<Activate />} />

          {/* Aplicación Protegida */}

          <Route element={<ProtectedRoute />}>
            <Route element={<ProtectedLayout theme={theme} toggleTheme={toggleTheme} />}>
              <Route path="/" element={<Welcome />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/devices" element={<DeviceList />} />
              <Route path="/devices/new" element={<DeviceForm />} />
              <Route path="/devices/:id" element={<DeviceForm />} />
              <Route path="/devices/:id/edit" element={<DeviceForm />} />
              <Route path="/search" element={<DeviceSearch />} />
              <Route path="/report/new" element={<ReportForm />} />
              <Route path="/recursos-pos" element={<RecursosPos />} />
              <Route path="/quotation/new" element={<QuotationForm />} />
              <Route path="/partes" element={<Inventory />} />
              <Route path="/settings" element={<Settings theme={theme} onToggleTheme={toggleTheme} />} />
              <Route path="/atc/inbox" element={<AtcInbox />} />
              <Route path="*" element={<Welcome />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
