import { useFormContext, useWatch } from 'react-hook-form';
import { ProgressBar } from '../../../../components/ui';
import type { IncidentFormValues } from '../../types';
import styles from './CompletionBar.module.css';

const QUICK_FIELDS: (keyof IncidentFormValues)[] = [
  'incidentType', 'dateTime', 'description',
];

const FULL_FIELDS: (keyof IncidentFormValues)[] = [
  'division', 'project', 'severity', 'immediateActions', 'shift', 'weather',
];

function isFilled(val: unknown): boolean {
  if (val === null || val === undefined || val === '') return false;
  if (typeof val === 'boolean') return true;
  if (typeof val === 'object') {
    // location object
    const loc = val as Record<string, unknown>;
    return Boolean(loc.textDescription);
  }
  return true;
}

export function CompletionBar() {
  const { control } = useFormContext<IncidentFormValues>();
  const values = useWatch({ control });

  const allFields = [...QUICK_FIELDS, 'location', ...FULL_FIELDS] as (keyof IncidentFormValues)[];
  const filled = allFields.filter((f) => isFilled(values[f])).length;
  const pct = Math.round((filled / allFields.length) * 100);

  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>Report Completion</p>
      <ProgressBar value={pct} />
    </div>
  );
}
