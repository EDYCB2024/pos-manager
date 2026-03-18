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
import Tracking from './pages/Tracking';
import AllyVatc from './pages/AllyVatc';
import AllyCredicard from './pages/AllyCredicard';
import AllyPlatco from './pages/AllyPlatco';
import AllyPlatcoPos from './pages/AllyPlatcoPos';
import AllyBanplus from './pages/AllyBanplus';
import AllyPosComercial from './pages/AllyPosComercial';
import AllyBancoExterior from './pages/AllyBancoExterior';
import AllyInstapago from './pages/AllyInstapago';
import AllyBancaribe from './pages/AllyBancaribe';
import AllyBancoActivo from './pages/AllyBancoActivo';
import AllyTokenPagos from './pages/AllyTokenPagos';
import AllyBancrecer from './pages/AllyBancrecer';
import AllyBestPay from './pages/AllyBestPay';
import AllyDelSur from './pages/AllyDelSur';
import AllyOtros from './pages/AllyOtros';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import ChatWindow from './components/Assistant/ChatWindow';
import { Outlet } from 'react-router-dom';
import './App.css';

function ProtectedLayout({ theme, toggleTheme }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarCollapsed', newState);
      return newState;
    });
  };

  return (
    <div className={`app-shell ${isCollapsed ? 'app-shell--collapsed' : ''}`}>
      <Sidebar theme={theme} onToggleTheme={toggleTheme} isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
      <main className="app-main">
        <Navbar />
        <div className="app-content">
          <Outlet />
        </div>
        <ChatWindow />
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
              <Route path="/tracking" element={<Tracking />} />
              <Route path="/report/new" element={<ReportForm />} />
              <Route path="/recursos-pos" element={<RecursosPos />} />
              <Route path="/quotation/new" element={<QuotationForm />} />
              <Route path="/partes" element={<Inventory />} />
              <Route path="/settings" element={<Settings theme={theme} onToggleTheme={toggleTheme} />} />
              <Route path="/atc/inbox" element={<AtcInbox />} />
              <Route path="/aliados/vatc" element={<AllyVatc />} />
              <Route path="/aliados/credicard" element={<AllyCredicard />} />
              <Route path="/aliados/platco" element={<AllyPlatco />} />
              <Route path="/aliados/platco-pos" element={<AllyPlatcoPos />} />
              <Route path="/aliados/banplus" element={<AllyBanplus />} />
              <Route path="/aliados/poscomercial" element={<AllyPosComercial />} />
              <Route path="/aliados/banco-exterior" element={<AllyBancoExterior />} />
              <Route path="/aliados/instapago" element={<AllyInstapago />} />
              <Route path="/aliados/bancaribe" element={<AllyBancaribe />} />
              <Route path="/aliados/banco-activo" element={<AllyBancoActivo />} />
              <Route path="/aliados/token-pagos" element={<AllyTokenPagos />} />
              <Route path="/aliados/bancrecer" element={<AllyBancrecer />} />
              <Route path="/aliados/best-pay" element={<AllyBestPay />} />
              <Route path="/aliados/del-sur" element={<AllyDelSur />} />
              <Route path="/aliados/otros" element={<AllyOtros />} />
              <Route path="*" element={<Welcome />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
