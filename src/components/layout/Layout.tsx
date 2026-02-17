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
    <div className="min-h-screen flex bg-[#FAF6F1]">
      {/* 侧边栏 */}
      <aside className="w-60 bg-white border-r border-[#E8DFD5] fixed left-0 top-0 bottom-0 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-[#E8DFD5]">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5A2B] to-[#C4956A] flex items-center justify-center text-white font-bold text-lg">
              R
            </div>
            <div>
              <div className="font-serif text-base font-semibold text-[#2C1810]">学术书卷</div>
              <div className="text-[10px] text-[#9A8677] uppercase tracking-wider">ResearchFlow</div>
            </div>
          </Link>
        </div>

        {/* 主导航 */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="text-[11px] font-medium text-[#9A8677] uppercase tracking-wider mb-2 px-3">
            功能
          </div>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-all ${
                location.pathname === item.path
                  ? 'bg-[#8B5A2B]/10 text-[#8B5A2B] font-medium'
                  : 'text-[#6B5344] hover:bg-[#F5EDE3]'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}

          <div className="text-[11px] font-medium text-[#9A8677] uppercase tracking-wider mb-2 px-3 mt-4">
            推广
          </div>
          {secondaryNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-all ${
                location.pathname === item.path
                  ? 'bg-[#8B5A2B]/10 text-[#8B5A2B] font-medium'
                  : 'text-[#6B5344] hover:bg-[#F5EDE3]'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* 用户信息 */}
        <div className="p-4 border-t border-[#E8DFD5]">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#F5EDE3] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B5A2B] to-[#C4956A] text-white flex items-center justify-center font-semibold text-sm">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-[#2C1810] truncate">{user.name}</div>
                  <div className="text-xs text-[#9A8677] truncate">{user.email}</div>
                </div>
              </button>
              
              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-[#E8DFD5] rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-[#A65D4E] hover:bg-[#F5EDE3] transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="block w-full py-2.5 text-center bg-gradient-to-r from-[#8B5A2B] to-[#A67C52] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              登录 / 注册
            </Link>
          )}
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 ml-60">
        {/* 顶部栏 */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#E8DFD5] px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#9A8677]">/</span>
              <span className="font-medium text-[#2C1810]">
                {navItems.find(n => n.path === location.pathname)?.label || 
                 secondaryNav.find(n => n.path === location.pathname)?.label || 
                 '工作台'}
              </span>
            </div>
            
            {/* 搜索框 */}
            <form onSubmit={handleSearch} className="relative w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索论文、任务..."
                className="w-full h-9 pl-9 pr-4 bg-[#FAF6F1] border border-[#E8DFD5] rounded-lg text-sm focus:outline-none focus:border-[#8B5A2B] focus:ring-1 focus:ring-[#8B5A2B]/20 transition-all"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A8677]">🔍</span>
            </form>
            
            {/* 右侧操作 */}
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 rounded-lg border border-[#E8DFD5] bg-white flex items-center justify-center text-sm hover:bg-[#F5EDE3] transition-colors">
                🔔
              </button>
              <button className="w-9 h-9 rounded-lg border border-[#E8DFD5] bg-white flex items-center justify-center text-sm hover:bg-[#F5EDE3] transition-colors">
                ⚙️
              </button>
            </div>
          </div>
        </header>

        {/* 内容 */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
