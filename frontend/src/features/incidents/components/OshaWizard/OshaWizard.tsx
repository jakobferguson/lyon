import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button, Modal, FormField } from '../../../../components/ui';
import type { IncidentFormValues } from '../../types';
import styles from './OshaWizard.module.css';

const DART_CONDITIONS = [
  'Days away from work',
  'Restricted work or transfer to another job',
];

const RECORDABLE_CONDITIONS = [
  'Death',
  'Days away from work',
  'Restricted work or transfer to another job',
  'Medical treatment beyond first aid',
  'Loss of consciousness',
  'Significant injury/illness diagnosed by physician',
];

type Step = 'start' | 'step2' | 'result';

export function OshaWizard() {
  const { setValue, watch, register, formState: { errors } } = useFormContext<IncidentFormValues>();
  const [open, setOpen]           = useState(false);
  const [step, setStep]           = useState<Step>('start');
  const [workRelated, setWorkRelated]   = useState<boolean | null>(null);
  const [checked, setChecked]     = useState<Set<string>>(new Set());
  const [showOverride, setShowOverride] = useState(false);

  const isRecordable = watch('isOshaRecordable');
  const isDart       = watch('isDart');

  function reset() {
    setStep('start');
    setWorkRelated(null);
    setChecked(new Set());
    setShowOverride(false);
  }

  function finish(recordable: boolean, dart: boolean) {
    setValue('isOshaRecordable', recordable, { shouldDirty: true });
    setValue('isDart', dart, { shouldDirty: true });
    setStep('result');
  }

  function handleStep2Submit() {
    if (checked.size === 0) {
      finish(false, false);
      return;
    }
    const dart = [...checked].some((c) => DART_CONDITIONS.includes(c));
    finish(true, dart);
  }

  function toggleCheck(cond: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(cond) ? next.delete(cond) : next.add(cond);
      return next;
    });
  }

  const statusLabel =
    isRecordable === null ? 'Not determined' :
    isRecordable ? (isDart ? 'Recordable — DART' : 'Recordable') : 'Not Recordable';

  const statusClass =
    isRecordable === null ? styles.unknown :
    isRecordable ? styles.recordable : styles.notRecordable;

  return (
    <div className={styles.wrapper}>
      <div className={styles.statusRow}>
        <span className={`${styles.statusBadge} ${statusClass}`}>
          OSHA: {statusLabel}
        </span>
        <Button type="button" variant="secondary" size="sm" onClick={() => { reset(); setOpen(true); }}>
          {isRecordable === null ? 'Determine Recordability' : 'Re-evaluate'}
        </Button>
        {isRecordable !== null && (
          <Button type="button" variant="secondary" size="sm" onClick={() => setShowOverride((v) => !v)}>
            Override
          </Button>
        )}
      </div>

      {showOverride && (
        <FormField
          label="Override Justification"
          required
          hint="Required when overriding the system determination. This is audit-logged."
          error={errors.oshaOverrideJustification?.message}
        >
          {(id) => (
            <textarea
              id={id}
              className="lyon-input"
              rows={3}
              placeholder="Explain why the system determination is being overridden…"
              {...register('oshaOverrideJustification', {
                required: 'Justification is required when overriding.',
              })}
            />
          )}
        </FormField>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="OSHA Recordability Determination">
        {step === 'start' && (
          <div className={styles.stepWrap}>
            <p className={styles.question}>Step 1: Was the incident work-related?</p>
            <div className={styles.btnGroup}>
              <Button type="button" variant="primary" onClick={() => { setWorkRelated(true); setStep('step2'); }}>
                Yes
              </Button>
              <Button type="button" variant="secondary" onClick={() => { setWorkRelated(false); finish(false, false); }}>
                No
              </Button>
            </div>
          </div>
        )}

        {step === 'step2' && workRelated && (
          <div className={styles.stepWrap}>
            <p className={styles.question}>
              Step 2: Did the incident result in any of the following?
            </p>
            <p className={styles.hint}>Check all that apply. Leave blank if none apply.</p>
            <ul className={styles.checkList}>
              {RECORDABLE_CONDITIONS.map((cond) => (
                <li key={cond}>
                  <label className={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={checked.has(cond)}
                      onChange={() => toggleCheck(cond)}
                    />
                    {cond}
                    {DART_CONDITIONS.includes(cond) && (
                      <span className={styles.dartTag}>DART</span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
            <div className={styles.btnGroup}>
              <Button type="button" variant="primary" onClick={handleStep2Submit}>
                Confirm
              </Button>
              <Button type="button" variant="secondary" onClick={() => setStep('start')}>
                Back
              </Button>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className={styles.stepWrap}>
            <p className={`${styles.resultBadge} ${isRecordable ? styles.recordable : styles.notRecordable}`}>
              {isRecordable ? (isDart ? '⚠ RECORDABLE — DART CASE' : '⚠ RECORDABLE') : '✓ NOT RECORDABLE'}
            </p>
            {isRecordable && isDart && (
              <p className={styles.hint}>This incident counts toward both TRIR and DART rate calculations.</p>
            )}
            {isRecordable && !isDart && (
              <p className={styles.hint}>This incident counts toward TRIR but not DART rate.</p>
            )}
            {!isRecordable && (
              <p className={styles.hint}>This incident is not OSHA recordable.</p>
            )}
            <Button type="button" variant="primary" onClick={() => setOpen(false)} style={{ marginTop: '1rem' }}>
              Done
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
