
import React from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/store';
import Monitor from './pages/Monitor';
import MapPage from './pages/Map';
import Workbench from './pages/Workbench';
import Alarms from './pages/Alarms';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import Settings from './pages/Settings';
import MediaLibrary from './pages/MediaLibrary';
import Login from './pages/Login';
import IssueDetail from './pages/IssueDetail';
import Reports from './pages/Reports';
import FireSafety from './pages/FireSafety';
import TaskList from './pages/TaskList';
import { Video, Map, LayoutGrid, Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';

const TabBar = () => {
    const { pathname } = useLocation();
    const { alarms } = useApp();

    // Hide tab bar on specific flows
    const hiddenPaths = ['/settings', '/login', '/media'];
    const isVehicleDetail = pathname.startsWith('/vehicles/');
    const isIssueDetail = pathname.startsWith('/issues/');
    const isReports = pathname === '/reports';
    const isFireSafety = pathname === '/fire-safety';
    const isTaskList = pathname === '/tasks';

    if (hiddenPaths.includes(pathname) || (isVehicleDetail && pathname !== '/vehicles') || isIssueDetail || isReports || isFireSafety || isTaskList) return null;

    const pendingAlarms = alarms.filter(a => a.status === 'PENDING').length;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-teal-950/80 backdrop-blur-xl border-t border-white/10 pb-safe px-6 h-16 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
            <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
                <LayoutGrid size={22} />
                <span className="text-[10px] font-medium">工作台</span>
            </NavLink>

            <NavLink to="/monitor" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
                <Video size={22} />
                <span className="text-[10px] font-medium">实时监控</span>
            </NavLink>

            <NavLink to="/map" className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
                <Map size={22} />
                <span className="text-[10px] font-medium">电子地图</span>
            </NavLink>

            <NavLink to="/alarms" className={({ isActive }) => `relative flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
                <div className="relative">
                    <Bell size={22} />
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

const ToastContainer = () => {
    const { toasts } = useApp();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-6 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-md border ${
                        toast.type === 'success' ? 'bg-green-900/80 text-green-100 border-green-500/30' :
                            toast.type === 'error' ? 'bg-red-900/80 text-red-100 border-red-500/30' :
                                'bg-slate-800/80 text-blue-100 border-blue-500/30'
                    }`}
                >
                    {toast.type === 'success' && <CheckCircle size={16} className="text-green-400" />}
                    {toast.type === 'error' && <AlertCircle size={16} className="text-red-400" />}
                    {toast.type === 'info' && <Info size={16} className="text-blue-400" />}
                    <span className="text-sm font-medium shadow-sm">{toast.message}</span>
                </div>
            ))}
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
        // Global Gradient Background applied here
        <div className="h-screen w-screen overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-teal-900 text-slate-100 flex flex-col">
            <ToastContainer />
            <div className="flex-1 overflow-hidden relative">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    {/* Default Route is now Workbench */}
                    <Route path="/" element={<ProtectedRoute><Workbench /></ProtectedRoute>} />
                    <Route path="/monitor" element={<ProtectedRoute><Monitor /></ProtectedRoute>} />
                    <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
                    <Route path="/alarms" element={<ProtectedRoute><Alarms /></ProtectedRoute>} />
                    <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
                    <Route path="/vehicles/:id" element={<ProtectedRoute><VehicleDetail /></ProtectedRoute>} />
                    <Route path="/issues/:id" element={<ProtectedRoute><IssueDetail /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/media" element={<ProtectedRoute><MediaLibrary /></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                    <Route path="/fire-safety" element={<ProtectedRoute><FireSafety /></ProtectedRoute>} />
                    <Route path="/tasks" element={<ProtectedRoute><TaskList /></ProtectedRoute>} />
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
