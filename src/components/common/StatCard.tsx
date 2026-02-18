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
        'flex flex-col gap-2 rounded-xl border bg-card p-6 shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">{value}</span>
        {trend && (
          <span
            className={cn(
              'text-sm font-medium',
              trend.isPositive ? 'text-green-500' : 'text-red-500'
            )}
          >
            {trend.isPositive ? '+' : '-'}
            {trend.value}%
          </span>
        )}
      </div>
      {description && (
        <span className="text-xs text-muted-foreground">{description}</span>
      )}
    </div>
  );
}

export default StatCard;
