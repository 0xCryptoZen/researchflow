import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import auth from '../services/auth';
import { Button } from '@/components/ui/button';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle OAuth callback
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId) {
      handleOAuthCallback(userId);
    }
  }, [searchParams]);
  
  const handleOAuthCallback = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await auth.handleOAuthCallback(userId);
      navigate('/');
    } catch (err) {
      console.error('OAuth callback error:', err);
      setError('登录失败，请重试');
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await auth.loginWithGitHub();
      // If we're in dev mode (cloud not available), this returns directly
      // Otherwise it should redirect
      if (auth.getCurrentUser()) {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('登录失败，请重试');
      setIsLoading(false);
    }
  };
  
  // For local development without cloud
  const handleLocalLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await auth.localLogin();
      navigate('/');
    } catch (err) {
      setError('本地登录失败');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景光效 */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#5E6AD2]/10 to-transparent rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#7C3AED]/8 to-transparent rounded-full blur-[100px]" />

      <div className="max-w-md w-full relative">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#5E6AD2] to-[#7C3AED] text-white font-bold text-xl mb-4 shadow-lg shadow-[rgba(94,106,210,0.3)]">
            R
          </div>
          <h1 className="text-2xl font-semibold text-[#EDEDEF] mb-1.5 tracking-tight">ResearchFlow</h1>
          <p className="text-[14px] text-[#71717A]">科研论文管理助手</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#18181B] rounded-xl border border-[rgba(255,255,255,0.08)] p-6 animate-fade-in-up delay-75">
          <h2 className="text-lg font-semibold text-[#EDEDEF] text-center mb-1">
            欢迎回来
          </h2>
          
          <p className="text-[13px] text-[#71717A] text-center mb-6">
            登录您的账户，开始管理您的科研论文
          </p>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-[rgba(244,63,94,0.1)] border border-[rgba(244,63,94,0.2)] text-[#FB7185] rounded-lg text-[12px]">
              {error}
            </div>
          )}

          {/* GitHub Login Button */}
          <Button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="w-full h-10 text-[13px]"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            )}
            <span className="ml-2">{isLoading ? '登录中...' : '使用 GitHub 登录'}</span>
          </Button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(255,255,255,0.06)]"></div>
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="px-3 bg-[#18181B] text-[#52525B]">或</span>
            </div>
          </div>

          {/* Local Dev Login */}
          <Button
            onClick={handleLocalLogin}
            disabled={isLoading}
            variant="secondary"
            className="w-full h-10 text-[13px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="ml-2">本地开发模式</span>
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-[12px] text-[#52525B] mt-5">
          登录即表示您同意我们的
          <a href="#" className="text-[#5E6AD2] hover:underline ml-1">服务条款</a>
          <span className="mx-1">和</span>
          <a href="#" className="text-[#5E6AD2] hover:underline">隐私政策</a>
        </p>
      </div>
    </div>
  );
}
