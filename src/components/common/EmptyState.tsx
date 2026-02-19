import { cn } from '@/lib/utils';
import { LucideIcon, FileX, Loader2, Search, Inbox, FolderOpen, Users, Calendar, BookOpen, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: 'default' | 'search' | 'folder' | 'users' | 'calendar' | 'book' | 'file';
}

const iconVariants = {
  default: FileX,
  search: Search,
  folder: FolderOpen,
  users: Users,
  calendar: Calendar,
  book: BookOpen,
  file: FileText,
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = 'default',
}: EmptyStateProps) {
  const Icon = icon || iconVariants[variant];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-2xl p-12 text-center',
        'bg-gradient-to-b from-[rgba(94,106,210,0.03)] to-transparent',
        'border border-dashed border-[rgba(255,255,255,0.06)]',
        className
      )}
    >
      <div className="empty-state-icon">
        <Icon className="h-7 w-7 text-[#5E6AD2]" />
      </div>
      <div className="flex flex-col gap-1.5 max-w-sm">
        <h3 className="text-base font-semibold text-[#EDEDEF]">{title}</h3>
        {description && (
          <p className="text-sm text-[#71717A] leading-relaxed">{description}</p>
        )}
      </div>
      {action && (
        <Button 
          onClick={action.onClick} 
          variant="outline" 
          className="mt-2 btn-hover-lift"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface LoadingStateProps {
  text?: string;
  className?: string;
  variant?: 'default' | 'inline' | 'fullscreen';
}

export function LoadingState({ 
  text = '加载中...', 
  className,
  variant = 'default' 
}: LoadingStateProps) {
  if (variant === 'fullscreen') {
    return (
      <div
        className={cn(
          'fixed inset-0 flex flex-col items-center justify-center gap-4 z-50',
          'bg-[#0D0D0F]/80 backdrop-blur-sm',
          className
        )}
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5E6AD2] to-[#7C3AED] flex items-center justify-center animate-pulse-glow">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-[#5E6AD2]/20 animate-ping" />
        </div>
        <span className="text-sm text-[#A1A1AA] animate-breathe">{text}</span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 py-2', className)}>
        <Loader2 className="h-4 w-4 text-[#5E6AD2] animate-spin" />
        <span className="text-sm text-[#71717A]">{text}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 p-12',
        className
      )}
    >
      <div className="relative">
        <Loader2 className="h-10 w-10 text-[#5E6AD2] animate-spin" />
        <div className="absolute inset-0 rounded-full border-2 border-[#5E6AD2]/20 animate-pulse" />
      </div>
      <span className="text-sm text-[#71717A]">{text}</span>
    </div>
  );
}

/**
 * 错误状态组件
 */
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = '出错了',
  message = '加载内容时出现问题，请稍后重试。',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('error-container', className)}>
      <div className="error-icon">
        <AlertCircle className="h-10 w-10 text-[#F43F5E]" />
      </div>
      <h3 className="text-lg font-semibold text-[#EDEDEF] mb-2">{title}</h3>
      <p className="text-sm text-[#71717A] max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button 
          onClick={onRetry} 
          variant="outline"
          className="btn-hover-lift"
        >
          <Loader2 className="h-4 w-4 mr-2" />
          重试
        </Button>
      )}
    </div>
  );
}

/**
 * 成功状态组件
 */
interface SuccessStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function SuccessState({
  title = '操作成功',
  message,
  action,
  className,
}: SuccessStateProps) {
  return (
    <div className={cn('error-container', className)}>
      <div 
        className="error-icon"
        style={{ 
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))' 
        }}
      >
        <CheckCircle className="h-10 w-10 text-[#10B981]" />
      </div>
      <h3 className="text-lg font-semibold text-[#EDEDEF] mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-[#71717A] max-w-sm mb-6">{message}</p>
      )}
      {action && (
        <Button 
          onClick={action.onClick} 
          className="mt-2 btn-hover-lift"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * 无权限状态组件
 */
interface ForbiddenStateProps {
  title?: string;
  message?: string;
  className?: string;
}

export function ForbiddenState({
  title = '无权访问',
  message = '您没有权限查看此内容。',
  className,
}: ForbiddenStateProps) {
  return (
    <div className={cn('error-container', className)}>
      <div 
        className="error-icon"
        style={{ 
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))' 
        }}
      >
        <XCircle className="h-10 w-10 text-[#8B5CF6]" />
      </div>
      <h3 className="text-lg font-semibold text-[#EDEDEF] mb-2">{title}</h3>
      <p className="text-sm text-[#71717A] max-w-sm">{message}</p>
    </div>
  );
}

export default EmptyState;
