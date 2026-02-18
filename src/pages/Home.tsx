import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [papersCount, setPapersCount] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);
  const [conferencesCount, setConferencesCount] = useState(0);

  useEffect(() => {
    const papers = JSON.parse(localStorage.getItem('researchflow_papers') || '[]');
    const tasks = JSON.parse(localStorage.getItem('researchflow_tasks') || '[]');
    const conferences = JSON.parse(localStorage.getItem('researchflow_conferences') || '[]');
    setPapersCount(papers.length);
    setTasksCount(tasks.filter((t: any) => t.status !== 'completed').length);
    setConferencesCount(conferences.length);
  }, []);

  const features = [
    { 
      icon: '📚', 
      title: '论文管理', 
      desc: '一站式搜索与收藏学术论文，支持 arXiv、DBLP、Semantic Scholar 等多源', 
      link: '/papers',
      color: 'from-[#5E6AD2] to-[#7C3AED]'
    },
    { 
      icon: '📝', 
      title: '任务追踪', 
      desc: '规划科研里程碑与待办事项，智能提醒与进度追踪', 
      link: '/tasks',
      color: 'from-[#10B981] to-[#059669]'
    },
    { 
      icon: '📅', 
      title: '会议日历', 
      desc: '追踪截稿日期与会议动态，不错过任何deadline', 
      link: '/conferences',
      color: 'from-[#F59E0B] to-[#D97706]'
    },
    { 
      icon: '🤖', 
      title: 'AI 助手', 
      desc: '智能问答与数据管理，助您科研效率倍增', 
      link: '/pricing',
      color: 'from-[#EC4899] to-[#DB2777]'
    },
  ];

  const stats = [
    { label: '收藏论文', value: papersCount, icon: '📚' },
    { label: '待办任务', value: tasksCount, icon: '📝' },
    { label: '目标会议', value: conferencesCount, icon: '📅' },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0F]">
      {/* Hero */}
      <section className="relative py-32 px-6 overflow-hidden">
        {/* 装饰 - 暗色背景的光效 */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-[#5E6AD2]/8 to-transparent rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#7C3AED]/6 to-transparent rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-[#5E6AD2]/3 via-transparent to-[#7C3AED]/3 rounded-full blur-[150px]" />

        <div className="relative max-w-3xl mx-auto text-center">
          {/* 标签 - Linear 风格 */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(94,106,210,0.1)] border border-[rgba(94,106,210,0.15)] text-[#A5B4FC] text-[12px] font-medium mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5E6AD2] animate-pulse" />
            AI 驱动的学术研究助手
          </div>

          {/* 标题 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#EDEDEF] mb-6 leading-[1.1] tracking-tight animate-fade-in-up">
            ResearchFlow
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#5E6AD2] via-[#8B5CF6] to-[#A855F7]">
              学术工作流
            </span>
          </h1>

          {/* 描述 */}
          <p className="text-[15px] text-[#A1A1AA] mb-10 max-w-xl mx-auto leading-relaxed animate-fade-in-up delay-75">
            集论文搜索、智能管理、投稿追踪于一体的科研效率工具，
            现代化的界面设计，助您专注研究，轻松发表。
          </p>

          {/* 按钮 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16 animate-fade-in-up delay-150">
            <Button asChild size="lg" className="px-6 py-2.5">
              <Link to="/dashboard">进入工作台 →</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-6 py-2.5">
              <Link to="/pricing">了解专业版</Link>
            </Button>
          </div>

          {/* Stats - Linear 风格卡片 */}
          <div className="inline-flex items-center gap-6 px-6 py-4 bg-[rgba(24,24,27,0.8)] backdrop-blur-xl rounded-xl border border-[rgba(255,255,255,0.06)] animate-fade-in-up delay-225">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl mb-0.5 opacity-60">{stat.icon}</div>
                <div className="text-xl font-semibold text-[#EDEDEF]">{stat.value}</div>
                <div className="text-[10px] text-[#71717A] uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-[#EDEDEF] mb-2 tracking-tight">核心功能</h2>
          <p className="text-[#71717A] text-sm">全方位支持您的学术研究工作</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((feature, idx) => (
            <Card 
              key={idx} 
              className="group p-4 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${(idx + 1) * 75}ms` }}
            >
              <CardContent className="p-0">
                <Link to={feature.link} className="block">
                  <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-105 transition-transform duration-200 shadow-lg shadow-[rgba(0,0,0,0.2)]`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-[14px] font-semibold text-[#EDEDEF] mb-1.5 group-hover:text-[#A5B4FC] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-[12px] text-[#71717A] leading-relaxed">
                    {feature.desc}
                  </p>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#121212] border-y border-[rgba(255,255,255,0.06)]">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.15)] text-[#A855F7] text-[12px] font-medium mb-6">
            <span>🤖</span> AI 智能助手
          </div>

          <h2 className="text-2xl font-semibold text-[#EDEDEF] mb-3 tracking-tight">
            随时随地与 AI 助手对话
          </h2>

          <p className="text-[14px] text-[#71717A] mb-8 leading-relaxed">
            点击右下角聊天按钮，AI 助手随时为您服务。
            添加论文、管理任务、查询数据，只需一句话。
          </p>

          <Button asChild size="lg">
            <Link to="/pricing">
              升级专业版，解锁更多 AI 能力
              <span className="ml-1">→</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-[#0D0D0F] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5E6AD2] to-[#7C3AED] flex items-center justify-center text-white font-bold text-xs">
              R
            </div>
            <span className="text-sm font-semibold text-[#EDEDEF]">ResearchFlow</span>
          </div>

          <div className="flex items-center gap-6 text-[12px] text-[#52525B]">
            <Link to="/pricing" className="hover:text-[#A1A1AA] transition-colors">定价</Link>
            <a href="#" className="hover:text-[#A1A1AA] transition-colors">关于</a>
            <a href="#" className="hover:text-[#A1A1AA] transition-colors">隐私</a>
            <a href="#" className="hover:text-[#A1A1AA] transition-colors">联系</a>
          </div>

          <div className="text-[11px] text-[#3F3F46]">
            © 2026 ResearchFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
