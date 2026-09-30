import React, { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant =
  | 'operational'
  | 'in-use'
  | 'available'
  | 'maintenance'
  | 'deployed'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'blue'
  | 'neutral'
  | 'role-admin'
  | 'role-commander'
  | 'role-logistics';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  dot = false,
  className = '',
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; dot: string }> = {
    operational: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
    },
    'in-use': {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
    },
    available: {
      bg: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
      dot: 'bg-cyan-500',
    },
    maintenance: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dot: 'bg-amber-500',
    },
    deployed: {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      dot: 'bg-indigo-500',
    },
    pending: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dot: 'bg-amber-500',
    },
    approved: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
    },
    rejected: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dot: 'bg-rose-500',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
      dot: 'bg-blue-500',
    },
    neutral: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
    },
    'role-admin': {
      bg: 'bg-purple-100 text-purple-800 border-purple-200 font-semibold',
      dot: 'bg-purple-600',
    },
    'role-commander': {
      bg: 'bg-blue-100 text-blue-800 border-blue-200 font-semibold',
      dot: 'bg-blue-600',
    },
    'role-logistics': {
      bg: 'bg-amber-100 text-amber-800 border-amber-200 font-semibold',
      dot: 'bg-amber-600',
    },
  };

  const current = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.bg} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />}
      {children}
    </span>
  );
};
