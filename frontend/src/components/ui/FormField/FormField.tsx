import { type ReactNode, useId } from 'react';
import { cn } from '../../../utils/cn';
import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  hipaa?: boolean;
  children: (id: string) => ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  hint,
  required,
  hipaa,
  children,
  className,
}: FormFieldProps) {
  const id = useId();

  return (
    <div className={cn(styles.field, error && styles.hasError, className)}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required && <span className={styles.required} aria-hidden="true"> *</span>}
        {hipaa && (
          <span className={styles.hipaaBadge} title="HIPAA-protected field">
            HIPAA
          </span>
        )}
      </label>
      {children(id)}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
