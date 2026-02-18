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
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#18181B] p-4 transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">{title}</span>
        <Icon className="h-3.5 w-3.5 text-[#52525B]" />
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

export default StatCard;
