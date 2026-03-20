import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load all pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Properties = lazy(() => import('./pages/Properties'));
const Leads = lazy(() => import('./pages/Leads'));
const Clients = lazy(() => import('./pages/Clients'));
const Visits = lazy(() => import('./pages/Visits'));
const Reports = lazy(() => import('./pages/Reports'));
const ControlCenter = lazy(() => import('./pages/ControlCenter'));
const Settings = lazy(() => import('./pages/Settings'));
const Support = lazy(() => import('./pages/Support'));
const Login = lazy(() => import('./pages/Login'));

// Full-page loader component
const FullPageLoader: React.FC = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Suspense fallback={<FullPageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="propiedades" element={<Properties />} />
                <Route path="leads" element={<Leads />} />
                <Route path="clientes" element={<Clients />} />
                <Route path="visitas" element={<Visits />} />
                <Route path="reportes" element={<Reports />} />
                <Route path="control-center" element={<ControlCenter />} />
                <Route path="soporte" element={<Support />} />
                {/* LiveChat route removed - functionality consolidated in Support */}
                <Route path="configuracion" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;
