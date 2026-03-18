import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import { ToastProvider } from './contexts/ToastContext';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Properties = lazy(() => import('./pages/Properties'));
const Oportunidades = lazy(() => import('./pages/Oportunidades'));
const Clients = lazy(() => import('./pages/Clients'));
const Visits = lazy(() => import('./pages/Visits'));
const Reports = lazy(() => import('./pages/Reports'));
const ControlCenter = lazy(() => import('./pages/ControlCenter'));
const Settings = lazy(() => import('./pages/Settings'));
const Support = lazy(() => import('./pages/Support'));
const Tasks = lazy(() => import('./pages/Tasks'));

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
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<Suspense fallback={<FullPageLoader />}><Home /></Suspense>} />
            <Route path="properties" element={<Suspense fallback={<FullPageLoader />}><Properties /></Suspense>} />
            <Route path="leads" element={<Suspense fallback={<FullPageLoader />}><Oportunidades /></Suspense>} />
            <Route path="clients" element={<Suspense fallback={<FullPageLoader />}><Clients /></Suspense>} />
            <Route path="visits" element={<Suspense fallback={<FullPageLoader />}><Visits /></Suspense>} />
            <Route path="tasks" element={<Suspense fallback={<FullPageLoader />}><Tasks /></Suspense>} />
            <Route path="reports" element={<Suspense fallback={<FullPageLoader />}><Reports /></Suspense>} />
            <Route path="control" element={<Suspense fallback={<FullPageLoader />}><ControlCenter /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<FullPageLoader />}><Settings /></Suspense>} />
            <Route path="support" element={<Suspense fallback={<FullPageLoader />}><Support /></Suspense>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
};

export default App;
