import { useState } from 'react';
import { HoursWorkedForm } from '../../dashboard/components/HoursWorkedForm/HoursWorkedForm';
import { HOURS_WORKED_SEED } from '../../dashboard/types';
import type { HoursWorkedEntry } from '../../dashboard/types';
import styles from './AdminHoursRoute.module.css';

export function AdminHoursRoute() {
  const [entries, setEntries] = useState<HoursWorkedEntry[]>(HOURS_WORKED_SEED);
  const [showForm, setShowForm] = useState(false);

  function handleSave(entry: HoursWorkedEntry) {
    setEntries((prev) => [entry, ...prev]);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Hours Worked</h1>
          <p className={styles.subtitle}>Manage labor hours worked by period for TRIR and DART calculation.</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm(true)}>
          + Enter Hours
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Period</th>
              <th>Company-Wide</th>
              <th>Entered By</th>
              <th>Entered At</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td className={styles.periodCell}>{e.period}</td>
                <td>{e.companyWide.toLocaleString()} hrs</td>
                <td>{e.enteredBy}</td>
                <td>{new Date(e.enteredAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <HoursWorkedForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
      />
    </div>
  );
}
