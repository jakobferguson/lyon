import { type HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';
import styles from './Badge.module.css';

export type BadgeVariant = 'active' | 'pending' | 'overdue' | 'info' | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[variant], className)} {...props}>
      {children}
    </span>
  );
}
