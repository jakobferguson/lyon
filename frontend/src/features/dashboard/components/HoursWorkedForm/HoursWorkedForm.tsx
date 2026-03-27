import { useState } from 'react';
import { Modal, Button, FormField } from '../../../../components/ui';
import type { Division } from '../../../../types';
import type { HoursWorkedEntry } from '../../types';
import { HOURS_WORKED_SEED } from '../../types';
import styles from './HoursWorkedForm.module.css';

const DIVISIONS: Division[] = ['HCC', 'HRSI', 'HSI', 'HTI', 'HTSI', 'Herzog Energy', 'Green Group'];

interface HoursWorkedFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (entry: HoursWorkedEntry) => void;
}

export function HoursWorkedForm({ open, onClose, onSave }: HoursWorkedFormProps) {
  const [period, setPeriod]           = useState('2026-Q1');
  const [companyWide, setCompanyWide] = useState('');
  const [byDivision, setByDivision]   = useState<Partial<Record<Division, string>>>({});
  const [errors, setErrors]           = useState<Record<string, string>>({});

  function setDiv(div: Division, val: string) {
    setByDivision((prev) => ({ ...prev, [div]: val }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!period.trim())                    e.period = 'Period is required.';
    if (!companyWide || isNaN(Number(companyWide)) || Number(companyWide) <= 0)
      e.companyWide = 'Enter a valid company-wide hours figure.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const divParsed: Partial<Record<Division, number>> = {};
    for (const div of DIVISIONS) {
      const val = byDivision[div];
      if (val && !isNaN(Number(val)) && Number(val) > 0) {
        divParsed[div] = Number(val);
      }
    }
    onSave({
      id:          `hw-${Date.now()}`,
      period,
      companyWide: Number(companyWide),
      byDivision:  divParsed,
      enteredBy:   'T. Griffith',
      enteredAt:   new Date().toISOString(),
    });
    onClose();
  }

  const latest = HOURS_WORKED_SEED[HOURS_WORKED_SEED.length - 1];

  return (
    <Modal open={open} onClose={onClose} title="Enter Hours Worked" size="md">
      <div className={styles.body}>
        {latest && (
          <div className={styles.lastEntry}>
            <span className={styles.lastLabel}>Last entry:</span>
            <span>{latest.period} — {latest.companyWide.toLocaleString()} company-wide hours</span>
          </div>
        )}

        <div className={styles.form}>
          <FormField label="Reporting Period" required error={errors.period}>
            {(id) => (
              <input
                id={id}
                type="text"
                className="lyon-input"
                placeholder="e.g. 2026-Q2 or 2026"
                value={period}
                onChange={(e) => { setPeriod(e.target.value); if (errors.period) setErrors((p) => ({ ...p, period: undefined as unknown as string })); }}
              />
            )}
          </FormField>

          <FormField label="Company-Wide Hours Worked" required error={errors.companyWide}>
            {(id) => (
              <input
                id={id}
                type="number"
                className="lyon-input"
                placeholder="e.g. 295000"
                min={0}
                value={companyWide}
                onChange={(e) => { setCompanyWide(e.target.value); if (errors.companyWide) setErrors((p) => ({ ...p, companyWide: undefined as unknown as string })); }}
              />
            )}
          </FormField>

          <div className={styles.divisionSection}>
            <h3 className={styles.divisionTitle}>Per-Division Hours (optional)</h3>
            <div className={styles.divisionGrid}>
              {DIVISIONS.map((div) => (
                <FormField key={div} label={div}>
                  {(id) => (
                    <input
                      id={id}
                      type="number"
                      className="lyon-input"
                      placeholder="hours"
                      min={0}
                      value={byDivision[div] ?? ''}
                      onChange={(e) => setDiv(div, e.target.value)}
                    />
                  )}
                </FormField>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="accent" onClick={handleSave}>Save Hours</Button>
        </div>
      </div>
    </Modal>
  );
}
