import { type ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import auth, { type AuthUser } from '../../services/auth';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/papers/search', label: '搜索论文', icon: '🔍' },
  { path: '/papers', label: '我的论文', icon: '📄' },
  { path: '/tasks', label: 'Tasks', icon: '✅' },
  { path: '/conferences', label: 'Conferences', icon: '📅' },
  { path: '/reminders', label: 'Reminders', icon: '🔔' },
  { path: '/outline', label: 'Outline', icon: '📋' },
  { path: '/references', label: 'References', icon: '📚' },
  { path: '/charts', label: 'Charts', icon: '📊' },
  { path: '/templates', label: 'Templates', icon: '📝' },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    setUser(auth.getCurrentUser());
  }, [location.pathname]);

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    navigate('/login');
  };

  // Show login page if not logged in
  if (!user && location.pathname !== '/login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">ResearchFlow</h1>
          <p className="text-slate-400 mb-6">请先登录</p>
          <Link to="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-slate-800">ResearchFlow</Link>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:bg-slate-100 rounded-lg px-3 py-2 transition-colors"
                >
                  <img
                    src={user.avatar || 'https://avatars.githubusercontent.com/u/49605145'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-slate-700">{user.name}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="text-sm font-medium text-slate-800">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                    <Link to="/settings" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                      ⚙️ 设置
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100"
                    >
                      🚪 退出登录
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <nav className="w-56 py-6 pr-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Main Content */}
        <main className="flex-1 py-6 pl-4">
          {children}
        </main>
      </div>
    </div>
  );
}
