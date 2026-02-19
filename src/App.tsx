import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
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
import Pricing from './pages/Pricing';
import Invite from './pages/Invite';
import PromotionPage from './pages/PromotionPage';
import ChatWidget from './components/ChatWidget';
import { PageTransition } from './components/ui/transition';

/**
 * 页面过渡组件
 * 路由切换时添加动画效果
 */
function AnimatedRoute({ children }: { children: ReactNode }) {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitioning, setTransitioning] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // 路由变化时触发动画
    setTransitioning(true);
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setTransitioning(false);
    }, 150); // 等待淡出动画完成

    return () => clearTimeout(timer);
  }, [location.pathname, children]);

  return (
    <div
      className={`transition-all duration-200 ${
        transitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      }`}
    >
      {displayChildren}
    </div>
  );
}

/**
 * 带过渡的路由组件
 */
function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <AnimatedRoute>
      <PageTransition>
        {children}
      </PageTransition>
    </AnimatedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/dashboard" element={<Layout><PageWrapper><Dashboard /></PageWrapper></Layout>} />
        <Route path="/settings/fields" element={<Layout><PageWrapper><ResearchFields /></PageWrapper></Layout>} />
        <Route path="/papers/search" element={<Layout><PageWrapper><Papers /></PageWrapper></Layout>} />
        <Route path="/papers" element={<Layout><PageWrapper><MyPapers /></PageWrapper></Layout>} />
        <Route path="/conferences" element={<Layout><PageWrapper><Conferences /></PageWrapper></Layout>} />
        <Route path="/tasks" element={<Layout><PageWrapper><Tasks /></PageWrapper></Layout>} />
        <Route path="/reminders" element={<Layout><PageWrapper><Reminders /></PageWrapper></Layout>} />
        <Route path="/templates" element={<Layout><PageWrapper><Templates /></PageWrapper></Layout>} />
        <Route path="/outline" element={<Layout><PageWrapper><Outline /></PageWrapper></Layout>} />
        <Route path="/references" element={<Layout><PageWrapper><References /></PageWrapper></Layout>} />
        <Route path="/charts" element={<Layout><PageWrapper><Charts /></PageWrapper></Layout>} />
        <Route path="/submissions" element={<Layout><PageWrapper><Submissions /></PageWrapper></Layout>} />
        <Route path="/writing" element={<Layout><PageWrapper><WritingProgress /></PageWrapper></Layout>} />
        <Route path="/pricing" element={<Layout><PageWrapper><Pricing /></PageWrapper></Layout>} />
        <Route path="/invite" element={<Layout><PageWrapper><Invite /></PageWrapper></Layout>} />
        <Route path="/promotion" element={<Layout><PageWrapper><PromotionPage /></PageWrapper></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatWidget />
    </BrowserRouter>
  );
}
