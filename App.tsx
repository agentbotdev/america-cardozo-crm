import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';

// Lazy-loaded pages for code splitting
import Home from './pages/Home';
import Properties from './pages/Properties';
import Oportunidades from './pages/Oportunidades';
import Clients from './pages/Clients';
import Visits from './pages/Visits';
import ControlCenter from './pages/ControlCenter';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';

const FullPageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-full min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-3 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Cargando...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              <Route index element={<Navigate to="/home" replace />} />
              <Route path="home" element={<Home />} />
              <Route path="properties" element={<Properties />} />
              <Route path="leads" element={<Oportunidades />} />
              <Route path="clients" element={<Clients />} />
              <Route path="visits" element={<Visits />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="control" element={<ControlCenter />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="support" element={<Support />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
