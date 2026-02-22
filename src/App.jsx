import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DeviceList from './pages/DeviceList';
import DeviceForm from './pages/DeviceForm';
import DeviceSearch from './pages/DeviceSearch';
import DeviceDetail from './pages/DeviceDetail';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <div className="app-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/devices" element={<DeviceList />} />
              <Route path="/devices/new" element={<DeviceForm />} />
              <Route path="/devices/:serial" element={<DeviceDetail />} />
              <Route path="/devices/:serial/edit" element={<DeviceForm />} />
              <Route path="/search" element={<DeviceSearch />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
