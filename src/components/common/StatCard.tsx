import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  /** 图标背景色 */
  iconBg?: string;
  /** 图标颜色 */
  iconColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  iconBg = 'bg-[rgba(94,106,210,0.1)]',
  iconColor = 'text-[#A5B4FC]',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#18181B] p-4',
        'transition-all duration-250 ease-out',
        'hover:border-[rgba(94,106,210,0.2)] hover:bg-[#1A1A1E]',
        'hover:shadow-lg hover:shadow-[rgba(94,106,210,0.08)]',
        'hover:-translate-y-0.5 active:translate-y-0',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">{title}</span>
        <div className={cn('p-1.5 rounded-lg', iconBg)}>
          <Icon className={cn('h-3.5 w-3.5', iconColor)} />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold text-[#EDEDEF] tracking-tight">{value}</span>
        {trend && (
          <span
            className={cn(
              'text-[11px] font-medium',
              trend.isPositive ? 'text-[#34D399]' : 'text-[#FB7185]'
            )}
          >
            {trend.isPositive ? '+' : '-'}
            {trend.value}%
          </span>
        )}
      </div>
      {description && (
        <span className="text-[11px] text-[#52525B]">{description}</span>
      )}
    </div>
  );
}

/**
 * 大号统计卡片 - 用于 Dashboard 首屏
 */
export function StatCardLarge({
  title,
  value,
  icon: Icon,
  description,
  trend,
  iconBg = 'bg-[rgba(94,106,210,0.1)]',
  iconColor = 'text-[#A5B4FC]',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#18181B] p-5',
        'transition-all duration-250 ease-out',
        'hover:border-[rgba(94,106,210,0.25)] hover:bg-[#1A1A1E]',
        'hover:shadow-xl hover:shadow-[rgba(94,106,210,0.1)]',
        'hover:-translate-y-1 active:translate-y-0',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-[#71717A] uppercase tracking-wider">{title}</span>
        <div className={cn('p-2 rounded-lg', iconBg)}>
          <Icon className={cn('h-4 w-4', iconColor)} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-[#EDEDEF] tracking-tight">{value}</span>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium',
              trend.isPositive ? 'text-[#34D399]' : 'text-[#FB7185]'
            )}
          >
            {trend.isPositive ? '+' : '-'}
            {trend.value}%
          </span>
        )}
      </div>
      {description && (
        <span className="text-xs text-[#52525B]">{description}</span>
      )}
    </div>
  );
}

export default StatCard;
