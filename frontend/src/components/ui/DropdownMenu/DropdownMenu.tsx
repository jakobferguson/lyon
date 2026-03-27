import * as Radix from '@radix-ui/react-dropdown-menu';
import { type ReactNode } from 'react';
import styles from './DropdownMenu.module.css';

export const DropdownMenu = Radix.Root;
export const DropdownMenuTrigger = Radix.Trigger;

interface DropdownMenuContentProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
}

export function DropdownMenuContent({ children, align = 'end' }: DropdownMenuContentProps) {
  return (
    <Radix.Portal>
      <Radix.Content className={styles.content} align={align} sideOffset={6}>
        {children}
      </Radix.Content>
    </Radix.Portal>
  );
}

interface DropdownMenuItemProps {
  children: ReactNode;
  onSelect?: () => void;
  destructive?: boolean;
}

export function DropdownMenuItem({ children, onSelect, destructive }: DropdownMenuItemProps) {
  return (
    <Radix.Item
      className={`${styles.item} ${destructive ? styles.destructive : ''}`}
      onSelect={onSelect}
    >
      {children}
    </Radix.Item>
  );
}

export function DropdownMenuSeparator() {
  return <Radix.Separator className={styles.separator} />;
}
