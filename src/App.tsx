import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout';
import HomePage from '@/pages/HomePage';
import ClientDetailPage from '@/pages/ClientDetailPage';
import ClientPeoplePage from '@/pages/ClientPeoplePage';
import ClientContactsPage from '@/pages/ClientContactsPage';
import ClientContactDetailPage from '@/pages/ClientContactDetailPage';
import ClientContractsPage from '@/pages/ClientContractsPage';
import ClientContractDetailPage from '@/pages/ClientContractDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<HomePage />} />
          <Route path="client/:clientId" element={<ClientDetailPage />} />
          <Route path="client/:clientId/people" element={<ClientPeoplePage />} />
          <Route path="client/:clientId/contacts" element={<ClientContactsPage />} />
          <Route path="client/:clientId/contact/:contactId" element={<ClientContactDetailPage />} />
          <Route path="client/:clientId/contracts" element={<ClientContractsPage />} />
          <Route path="client/:clientId/contract/:contractId" element={<ClientContractDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
