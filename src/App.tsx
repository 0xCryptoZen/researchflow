import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ResearchFields from './pages/ResearchFields';
import Papers from './pages/Papers';
import MyPapers from './pages/MyPapers';
import Conferences from './pages/Conferences';
import Tasks from './pages/Tasks';
import Reminders from './pages/Reminders';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/settings/fields" element={<Layout><ResearchFields /></Layout>} />
        <Route path="/papers/search" element={<Layout><Papers /></Layout>} />
        <Route path="/papers" element={<Layout><MyPapers /></Layout>} />
        <Route path="/conferences" element={<Layout><Conferences /></Layout>} />
        <Route path="/tasks" element={<Layout><Tasks /></Layout>} />
        <Route path="/reminders" element={<Layout><Reminders /></Layout>} />
        <Route path="/templates" element={<Layout><div className="text-slate-600">模板库页面 - 开发中</div></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
