import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(styles.btn, styles[variant], styles[size], className)}
        {...props}
      >
        {isLoading ? <span className={styles.spinner} aria-hidden="true" /> : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
