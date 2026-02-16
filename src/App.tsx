import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ResearchFields from './pages/ResearchFields';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/settings/fields" element={<Layout><ResearchFields /></Layout>} />
        <Route path="/papers" element={<Layout><div className="text-slate-600">论文管理页面 - 开发中</div></Layout>} />
        <Route path="/tasks" element={<Layout><div className="text-slate-600">任务管理页面 - 开发中</div></Layout>} />
        <Route path="/conferences" element={<Layout><div className="text-slate-600">会议管理页面 - 开发中</div></Layout>} />
        <Route path="/templates" element={<Layout><div className="text-slate-600">模板库页面 - 开发中</div></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
