import { type HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  kpi?: boolean;
}

export function Card({ kpi, className, children, ...props }: CardProps) {
  return (
    <div className={cn(styles.card, kpi && styles.kpi, className)} {...props}>
      {children}
    </div>
  );
}
