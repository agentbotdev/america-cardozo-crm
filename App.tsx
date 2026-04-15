import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages
const Login         = lazy(() => import('./pages/Login'));
const Dashboard     = lazy(() => import('./pages/Dashboard'));
const Properties    = lazy(() => import('./pages/Properties'));
const Leads         = lazy(() => import('./pages/Leads'));
const Clients       = lazy(() => import('./pages/Clients'));
const Visits        = lazy(() => import('./pages/Visits'));
const Reports       = lazy(() => import('./pages/Reports'));
const ControlCenter = lazy(() => import('./pages/ControlCenter'));
const Settings      = lazy(() => import('./pages/Settings'));
const Support       = lazy(() => import('./pages/Support'));
const Tasks         = lazy(() => import('./pages/Tasks'));
const LiveChat      = lazy(() => import('./pages/LiveChat'));

const App: React.FC = () => {
  return (
    <HashRouter>
      <Suspense fallback={
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-8">
          <div className="animate-spin w-12 h-12 border-[4px] border-indigo-500 border-t-transparent rounded-full shadow-2xl shadow-indigo-500/20"/>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-white font-black text-xs uppercase tracking-[0.6em] opacity-50">Iniciando Sistema</h2>
            <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="w-full h-full bg-indigo-500 animate-[loading-bar_2s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      }>
        <Routes>
          {/* Ruta pública — Login */}
          <Route path="/login" element={<Suspense fallback={null}><Login /></Suspense>} />

          {/* Rutas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Suspense fallback={null}><Dashboard /></Suspense>} />
            <Route path="propiedades" element={<Suspense fallback={null}><Properties /></Suspense>} />
            <Route path="leads" element={<Suspense fallback={null}><Leads /></Suspense>} />
            <Route path="clientes" element={<Suspense fallback={null}><Clients /></Suspense>} />
            <Route path="visitas" element={<Suspense fallback={null}><Visits /></Suspense>} />
            <Route path="reportes" element={<Suspense fallback={null}><Reports /></Suspense>} />
            <Route path="control-center" element={<Suspense fallback={null}><ControlCenter /></Suspense>} />
            <Route path="soporte" element={<Suspense fallback={null}><Support /></Suspense>} />
            <Route path="tareas" element={<Suspense fallback={null}><Tasks /></Suspense>} />
            <Route path="live-chat" element={<Suspense fallback={null}><LiveChat /></Suspense>} />
            <Route path="configuracion" element={<Suspense fallback={null}><Settings /></Suspense>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

export default App;
