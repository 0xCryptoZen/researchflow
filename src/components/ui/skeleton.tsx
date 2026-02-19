import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 基础骨架屏组件
 */
export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div 
      className={cn('skeleton animate-skeleton', className)} 
      style={style}
    />
  );
}

/**
 * 文本骨架屏
 */
export function SkeletonText({ 
  className, 
  lines = 3 
}: { 
  className?: string; 
  lines?: number 
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            'h-4',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )} 
        />
      ))}
    </div>
  );
}

/**
 * 卡片骨架屏
 */
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('linear-card p-4 space-y-3', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

/**
 * 表格骨架屏
 */
export function SkeletonTable({ 
  className, 
  rows = 5,
  columns = 4 
}: { 
  className?: string; 
  rows?: number;
  columns?: number;
}) {
  return (
    <div className={cn('linear-card overflow-hidden', className)}>
      <div className="border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="flex-1 p-3">
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="flex border-b border-[rgba(255,255,255,0.04)] last:border-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1 p-3">
              <Skeleton className="h-4" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * 统计卡片骨架屏
 */
export function SkeletonStatCard({ className }: SkeletonProps) {
  return (
    <div className={cn('linear-card p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

/**
 * 列表骨架屏
 */
export function SkeletonList({ 
  className, 
  items = 4 
}: { 
  className?: string; 
  items?: number 
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div 
          key={i} 
          className="linear-card p-3 flex items-center gap-3"
        >
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 个人资料骨架屏
 */
export function SkeletonProfile({ className }: SkeletonProps) {
  return (
    <div className={cn('linear-card p-6', className)}>
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * 图表骨架屏
 */
export function SkeletonChart({ className }: SkeletonProps) {
  return (
    <div className={cn('linear-card p-4', className)}>
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex items-end gap-1 h-32">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1 rounded-t"
            style={{ height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 表单骨架屏
 */
export function SkeletonForm({ className }: SkeletonProps) {
  return (
    <div className={cn('linear-card p-6 space-y-4', className)}>
      <Skeleton className="h-5 w-24" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
