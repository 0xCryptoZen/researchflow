import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

interface ListItemTransitionProps extends PageTransitionProps {
  index?: number;
  staggerDelay?: number;
}

/**
 * 页面切换过渡动画组件
 * 提供平滑的淡入上移动画效果
 */
export function PageTransition({ 
  children, 
  className,
  delay = 0 
}: PageTransitionProps) {
  return (
    <div 
      className={cn(
        'animate-fade-in-up',
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {children}
    </div>
  );
}

/**
 * 卡片过渡动画
 */
export function CardTransition({ 
  children, 
  className,
  delay = 0 
}: PageTransitionProps) {
  return (
    <div 
      className={cn(
        'animate-fade-in-up',
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {children}
    </div>
  );
}

/**
 * 列表项过渡动画
 */
export function ListItemTransition({ 
  children, 
  className,
  index = 0,
  staggerDelay = 50
}: ListItemTransitionProps) {
  return (
    <div 
      className={cn(
        'animate-fade-in-up',
        className
      )}
      style={{ animationDelay: `${index * staggerDelay}ms`, animationFillMode: 'both' }}
    >
      {children}
    </div>
  );
}

/**
 * 渐显动画
 */
export function FadeIn({ 
  children, 
  className,
  delay = 0 
}: PageTransitionProps) {
  return (
    <div 
      className={cn(
        'animate-fade-in',
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {children}
    </div>
  );
}

/**
 * 缩放渐显动画
 */
export function ScaleIn({ 
  children, 
  className,
  delay = 0 
}: PageTransitionProps) {
  return (
    <div 
      className={cn(
        'animate-scale-in',
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {children}
    </div>
  );
}
