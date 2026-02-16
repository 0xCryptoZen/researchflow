import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/papers" element={<div className="text-slate-600">Papers Page - Coming Soon</div>} />
          <Route path="/tasks" element={<div className="text-slate-600">Tasks Page - Coming Soon</div>} />
          <Route path="/conferences" element={<div className="text-slate-600">Conferences Page - Coming Soon</div>} />
          <Route path="/templates" element={<div className="text-slate-600">Templates Page - Coming Soon</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
