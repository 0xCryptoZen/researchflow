import { type ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, type AuthUser } from '../../services/auth';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/dashboard', label: '工作台', icon: '📊' },
  { path: '/papers/search', label: '论文搜索', icon: '🔍' },
  { path: '/papers', label: '我的收藏', icon: '📚' },
  { path: '/tasks', label: '任务管理', icon: '📝' },
  { path: '/conferences', label: '会议日历', icon: '📅' },
  { path: '/submissions', label: '投稿进度', icon: '📤' },
  { path: '/writing', label: '写作进度', icon: '✍️' },
  { path: '/references', label: '参考文献', icon: '📖' },
  { path: '/charts', label: '图表管理', icon: '📈' },
  { path: '/outline', label: '论文大纲', icon: '📋' },
  { path: '/templates', label: 'LaTeX 模板', icon: '📄' },
  { path: '/reminders', label: '提醒设置', icon: '🔔' },
];

const secondaryNav = [
  { path: '/invite', label: '邀请好友', icon: '🎁' },
  { path: '/promotion', label: '限时活动', icon: '🔥' },
  { path: '/pricing', label: '订阅服务', icon: '💎' },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/papers/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0D0D0F]">
      {/* 侧边栏 - Linear 风格 */}
      <aside className="w-[240px] bg-[#121212] border-r border-[rgba(255,255,255,0.06)] fixed left-0 top-0 bottom-0 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-[rgba(255,255,255,0.06)]">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#5E6AD2] to-[#7C3AED] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[rgba(94,106,210,0.25)] group-hover:scale-105 transition-transform duration-200">
              R
            </div>
            <div>
              <div className="text-sm font-semibold text-[#EDEDEF] tracking-tight">ResearchFlow</div>
              <div className="text-[10px] text-[#71717A] uppercase tracking-wider">学术工作台</div>
            </div>
          </Link>
        </div>

        {/* 主导航 */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <div className="text-[10px] font-medium text-[#52525B] uppercase tracking-wider mb-2 px-2">
            功能
          </div>
          {navItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md mb-0.5 text-[13px] transition-all duration-150 animate-fade-in ${
                location.pathname === item.path
                  ? 'bg-[rgba(94,106,210,0.1)] text-[#A5B4FC] font-medium'
                  : 'text-[#A1A1AA] hover:bg-[#1A1A1E] hover:text-[#EDEDEF]'
              }`}
              style={{ animationDelay: `${index * 25}ms` }}
            >
              <span className="text-[14px] opacity-80">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}

          <div className="text-[10px] font-medium text-[#52525B] uppercase tracking-wider mb-2 px-2 mt-4">
            推广
          </div>
          {secondaryNav.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md mb-0.5 text-[13px] transition-all duration-150 animate-fade-in ${
                location.pathname === item.path
                  ? 'bg-[rgba(94,106,210,0.1)] text-[#A5B4FC] font-medium'
                  : 'text-[#A1A1AA] hover:bg-[#1A1A1E] hover:text-[#EDEDEF]'
              }`}
              style={{ animationDelay: `${(navItems.length + index) * 25}ms` }}
            >
              <span className="text-[14px] opacity-80">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* 用户信息 */}
        <div className="p-3 border-t border-[rgba(255,255,255,0.06)]">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#1A1A1E] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5E6AD2] to-[#7C3AED] text-white flex items-center justify-center font-semibold text-xs shadow-md">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-[13px] font-medium text-[#EDEDEF] truncate">{user.name}</div>
                  <div className="text-[11px] text-[#71717A] truncate">{user.email}</div>
                </div>
              </button>
              
              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1A1A1E] border border-[rgba(255,255,255,0.08)] rounded-lg shadow-xl shadow-black/20 overflow-hidden animate-scale-in">
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-left text-[13px] text-[#FB7185] hover:bg-[#27272A] transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="block w-full py-2 text-center bg-gradient-to-r from-[#5E6AD2] to-[#7C3AED] text-white rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[rgba(94,106,210,0.2)]"
            >
              登录 / 注册
            </Link>
          )}
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 ml-[240px]">
        {/* 顶部栏 - Linear 风格 */}
        <header className="sticky top-0 z-10 bg-[#0D0D0F]/80 backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#52525B]">/</span>
              <span className="text-sm font-medium text-[#EDEDEF]">
                {navItems.find(n => n.path === location.pathname)?.label || 
                 secondaryNav.find(n => n.path === location.pathname)?.label || 
                 '工作台'}
              </span>
            </div>
            
            {/* 搜索框 */}
            <form onSubmit={handleSearch} className="relative w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索论文、任务..."
                className="w-full h-8 pl-8 pr-3 bg-[#18181B] border border-[rgba(255,255,255,0.06)] rounded-lg text-[13px] text-[#EDEDEF] placeholder:text-[#52525B] focus:outline-none focus:border-[rgba(94,106,210,0.4)] focus:ring-2 focus:ring-[rgba(94,106,210,0.1)] focus:bg-[#1A1A1E] transition-all duration-150"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#52525B] text-sm">🔍</span>
            </form>
            
            {/* 右侧操作 */}
            <div className="flex items-center gap-1.5">
              <button className="w-8 h-8 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#18181B] flex items-center justify-center text-sm hover:bg-[#27272A] hover:border-[rgba(255,255,255,0.1)] transition-all duration-150">
                🔔
              </button>
              <button className="w-8 h-8 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#18181B] flex items-center justify-center text-sm hover:bg-[#27272A] hover:border-[rgba(255,255,255,0.1)] transition-all duration-150">
                ⚙️
              </button>
            </div>
          </div>
        </header>

        {/* 内容区 */}
        <div className="p-5">
          {children}
        </div>
      </main>
    </div>
  );
}
