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
import Templates from './pages/Templates';
import Outline from './pages/Outline';
import References from './pages/References';
import Charts from './pages/Charts';
import Submissions from './pages/Submissions';
import WritingProgress from './pages/WritingProgress';

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
        <Route path="/templates" element={<Layout><Templates /></Layout>} />
        <Route path="/outline" element={<Layout><Outline /></Layout>} />
        <Route path="/references" element={<Layout><References /></Layout>} />
        <Route path="/charts" element={<Layout><Charts /></Layout>} />
        <Route path="/submissions" element={<Layout><Submissions /></Layout>} />
        <Route path="/writing" element={<Layout><WritingProgress /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
