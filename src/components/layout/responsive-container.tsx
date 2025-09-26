'use client';

import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveContainer({ children, className = '' }: ResponsiveContainerProps) {
  return (
    <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  cols = { default: 1 }, 
  gap = 4,
  className = '' 
}: ResponsiveGridProps) {
  const gridClasses = [
    `grid gap-${gap}`,
    cols.default > 1 && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    className
  ].filter(Boolean).join(' ');

  return <div className={gridClasses}>{children}</div>;
}

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  mobilePadding?: 'sm' | 'md' | 'lg';
}

export function ResponsiveCard({ children, className = '', mobilePadding = 'md' }: ResponsiveCardProps) {
  const paddingClasses = {
    sm: 'p-2 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${paddingClasses[mobilePadding]} ${className}`}>
      {children}
    </div>
  );
}