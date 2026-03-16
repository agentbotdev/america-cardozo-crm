import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Leads from './pages/Leads';
import Clients from './pages/Clients';
import Visits from './pages/Visits';
import Reports from './pages/Reports';
import ControlCenter from './pages/ControlCenter';
import Settings from './pages/Settings';
import Support from './pages/Support';

import LiveChat from './pages/LiveChat';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="propiedades" element={<Properties />} />
          <Route path="leads" element={<Leads />} />
          <Route path="clientes" element={<Clients />} />
          <Route path="visitas" element={<Visits />} />
          <Route path="reportes" element={<Reports />} />
          <Route path="control-center" element={<ControlCenter />} />
          <Route path="soporte" element={<Support />} />
          <Route path="live-chat" element={<LiveChat />} />
          <Route path="configuracion" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
