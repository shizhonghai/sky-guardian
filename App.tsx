import React from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/store';
import Monitor from './pages/Monitor';
import MapPage from './pages/Map';
import Workbench from './pages/Workbench';
import Alarms from './pages/Alarms';
import Vehicles from './pages/Vehicles';
import Settings from './pages/Settings';
import MediaLibrary from './pages/MediaLibrary';
import Login from './pages/Login';
import { Video, Map, LayoutGrid, Bell } from 'lucide-react';

const TabBar = () => {
  const { pathname } = useLocation();
  const { alarms } = useApp();
  
  // Hide tab bar on specific flows
  const hiddenPaths = ['/settings', '/vehicles', '/media', '/login'];
  if (hiddenPaths.includes(pathname)) return null;

  const pendingAlarms = alarms.filter(a => a.status === 'PENDING').length;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 pb-safe pt-2 px-6 h-20 flex justify-between items-start z-50">
      <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-500' : 'text-slate-500'}`}>
        <LayoutGrid size={24} />
        <span className="text-[10px] font-medium">工作台</span>
      </NavLink>

      <NavLink to="/monitor" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-500' : 'text-slate-500'}`}>
        <Video size={24} />
        <span className="text-[10px] font-medium">实时监控</span>
      </NavLink>
      
      <NavLink to="/map" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-500' : 'text-slate-500'}`}>
        <Map size={24} />
        <span className="text-[10px] font-medium">电子地图</span>
      </NavLink>

      <NavLink to="/alarms" className={({ isActive }) => `relative flex flex-col items-center gap-1 ${isActive ? 'text-blue-500' : 'text-slate-500'}`}>
        <div className="relative">
          <Bell size={24} />
          {pendingAlarms > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[8px] text-white items-center justify-center"></span>
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium">报警中心</span>
      </NavLink>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 flex flex-col">
      <div className="flex-1 overflow-hidden relative">
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Default Route is now Workbench */}
          <Route path="/" element={<ProtectedRoute><Workbench /></ProtectedRoute>} />
          <Route path="/monitor" element={<ProtectedRoute><Monitor /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
          <Route path="/alarms" element={<ProtectedRoute><Alarms /></ProtectedRoute>} />
          <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/media" element={<ProtectedRoute><MediaLibrary /></ProtectedRoute>} />
        </Routes>
      </div>
      <TabBar />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
};

export default App;