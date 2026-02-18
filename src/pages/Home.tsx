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
      color: 'from-amber-600/20 to-amber-700/10'
    },
    { 
      icon: '📝', 
      title: '任务追踪', 
      desc: '规划科研里程碑与待办事项，智能提醒与进度追踪', 
      link: '/tasks',
      color: 'from-emerald-600/20 to-emerald-700/10'
    },
    { 
      icon: '📅', 
      title: '会议日历', 
      desc: '追踪截稿日期与会议动态，不错过任何deadline', 
      link: '/conferences',
      color: 'from-violet-600/20 to-violet-700/10'
    },
    { 
      icon: '🤖', 
      title: 'AI 助手', 
      desc: '智能问答与数据管理，助您科研效率倍增', 
      link: '/pricing',
      color: 'from-orange-600/20 to-orange-700/10'
    },
  ];

  const stats = [
    { label: '收藏论文', value: papersCount, icon: '📚' },
    { label: '待办任务', value: tasksCount, icon: '📝' },
    { label: '目标会议', value: conferencesCount, icon: '📅' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      {/* Hero */}
      <section className="relative py-28 px-8 overflow-hidden">
        {/* 装饰 */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#8B5A2B]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#D4A574]/10 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto text-center">
          {/* 标签 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#8B5A2B]/10 to-[#C4956A]/10 text-[#8B5A2B] text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-[#8B5A2B] animate-pulse" />
            AI 驱动的学术研究助手
          </div>

          {/* 标题 */}
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-[#2C1810] mb-6 leading-tight">
            学术书卷
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#8B5A2B] to-[#C4956A]">
              研究工作流
            </span>
          </h1>

          {/* 描述 */}
          <p className="text-lg text-[#6B5344] mb-10 max-w-xl mx-auto leading-relaxed">
            集论文搜索、智能管理、投稿追踪于一体的科研效率工具，
            传承学术出版物的典雅质感，助您专注研究，轻松发表。
          </p>

          {/* 按钮 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button asChild className="px-8 py-3.5">
              <Link to="/papers">开始使用 →</Link>
            </Button>
            <Button asChild variant="outline" className="px-8 py-3.5">
              <Link to="/pricing">了解专业版</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="inline-flex items-center gap-8 px-8 py-5 bg-white/60 backdrop-blur-sm rounded-2xl border border-[#E8DFD5]">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold text-[#8B5A2B] font-serif">{stat.value}</div>
                <div className="text-xs text-[#9A8677]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl font-bold text-[#2C1810] mb-3">核心功能</h2>
          <p className="text-[#6B5344]">全方位支持您的学术研究工作</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, idx) => (
            <Card key={idx} className="group p-6 border-[#E8DFD5] hover:border-[#8B5A2B]/30 hover:shadow-xl hover:shadow-[#8B5A2B]/5 transition-all duration-300 cursor-pointer">
              <CardContent className="p-0">
                <Link to={feature.link} className="block">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-serif text-lg text-[#2C1810] mb-2 group-hover:text-[#8B5A2B] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#6B5344] leading-relaxed">
                    {feature.desc}
                  </p>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8 bg-white border-y border-[#E8DFD5]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-600/10 to-purple-600/10 text-violet-700 text-sm font-medium mb-6">
            <span>🤖</span> AI 智能助手
          </div>

          <h2 className="font-serif text-3xl font-bold text-[#2C1810] mb-4">
            随时随地与 AI 助手对话
          </h2>

          <p className="text-[#6B5344] mb-8">
            点击右下角聊天按钮，AI 助手随时为您服务。
            添加论文、管理任务、查询数据，只需一句话。
          </p>

          <Button asChild className="inline-flex items-center gap-2">
            <Link to="/pricing">
              升级专业版，解锁更多 AI 能力
              <span>→</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-8 bg-[#2C1810]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5A2B] to-[#C4956A] flex items-center justify-center text-white font-bold">
              R
            </div>
            <span className="font-serif font-semibold text-white">学术书卷</span>
          </div>

          <div className="flex items-center gap-8 text-sm text-white/50">
            <Link to="/pricing" className="hover:text-white transition-colors">定价</Link>
            <a href="#" className="hover:text-white transition-colors">关于</a>
            <a href="#" className="hover:text-white transition-colors">隐私</a>
            <a href="#" className="hover:text-white transition-colors">联系</a>
          </div>

          <div className="text-sm text-white/30">
            © 2026 ResearchFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
