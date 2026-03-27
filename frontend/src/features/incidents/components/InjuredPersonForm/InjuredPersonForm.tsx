import { useFormContext } from 'react-hook-form';
import { FormField } from '../../../../components/ui';
import { usePermission } from '../../../../hooks/usePermission';
import type { IncidentFormValues, InjuryType, BodyPart, BodySide, TreatmentType, ReturnToWorkStatus } from '../../types';
import { DIVISIONS } from '../../../../types';
import styles from './InjuredPersonForm.module.css';
const INJURY_TYPES: InjuryType[] = ['Laceration','Fracture','Sprain/Strain','Burn','Contusion','Amputation','Concussion','Illness','Other'];
const BODY_PARTS: BodyPart[] = ['Head','Eye','Neck','Shoulder','Arm','Elbow','Wrist','Hand','Finger','Chest','Back','Hip','Leg','Knee','Ankle','Foot','Toe','Multiple'];
const SIDES: BodySide[] = ['Left','Right','Bilateral','N/A'];
const TREATMENTS: TreatmentType[] = ['No Treatment','First Aid On-Site','Clinic/Urgent Care','Emergency Room','Hospitalization'];
const RTW: ReturnToWorkStatus[] = ['Full Duty','Restricted Duty','Off Work','Not Yet Determined'];

export function InjuredPersonForm() {
  const { register } = useFormContext<IncidentFormValues>();
  const hasMedicalAccess = usePermission('safety_coordinator');

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.heading}>Injured Person Details</h3>

      {!hasMedicalAccess && (
        <div className={styles.hipaaNotice} role="note">
          🔒 HIPAA-protected fields are restricted to Safety Coordinator and above.
          You may complete the non-protected fields below.
        </div>
      )}

      <div className={styles.grid}>
        {hasMedicalAccess && (
          <FormField label="Full Name" hipaa required>
            {(id) => (
              <input
                id={id}
                type="text"
                className="lyon-input"
                placeholder="First Last"
                {...register('injuredPersons.0.name')}
              />
            )}
          </FormField>
        )}

        <FormField label="Job Title">
          {(id) => (
            <input
              id={id}
              type="text"
              className="lyon-input"
              placeholder="e.g. Track Foreman"
              {...register('injuredPersons.0.jobTitle')}
            />
          )}
        </FormField>

        <FormField label="Division">
          {(id) => (
            <select id={id} className="lyon-input" {...register('injuredPersons.0.division')}>
              <option value="">Select division…</option>
              {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
        </FormField>

        <FormField label="Injury Type">
          {(id) => (
            <select id={id} className="lyon-input" {...register('injuredPersons.0.injuryType')}>
              <option value="">Select type…</option>
              {INJURY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
        </FormField>

        <FormField label="Body Part">
          {(id) => (
            <select id={id} className="lyon-input" {...register('injuredPersons.0.bodyPart')}>
              <option value="">Select body part…</option>
              {BODY_PARTS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          )}
        </FormField>

        <FormField label="Side">
          {(id) => (
            <select id={id} className="lyon-input" {...register('injuredPersons.0.bodySide')}>
              <option value="">Select side…</option>
              {SIDES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </FormField>

        {hasMedicalAccess && (
          <>
            <FormField label="Treatment Type" hipaa>
              {(id) => (
                <select id={id} className="lyon-input" {...register('injuredPersons.0.treatmentType')}>
                  <option value="">Select treatment…</option>
                  {TREATMENTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
            </FormField>

            <FormField label="Return-to-Work Status" hipaa>
              {(id) => (
                <select id={id} className="lyon-input" {...register('injuredPersons.0.returnToWork')}>
                  <option value="">Select status…</option>
                  {RTW.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              )}
            </FormField>

            <FormField label="Days Away from Work" hipaa hint="Used for DART rate calculation.">
              {(id) => (
                <input
                  id={id}
                  type="number"
                  min={0}
                  className="lyon-input"
                  {...register('injuredPersons.0.daysAway')}
                />
              )}
            </FormField>

            <FormField label="Days Restricted / Transferred" hipaa hint="Used for DART rate calculation.">
              {(id) => (
                <input
                  id={id}
                  type="number"
                  min={0}
                  className="lyon-input"
                  {...register('injuredPersons.0.daysRestricted')}
                />
              )}
            </FormField>
          </>
        )}
      </div>
    </div>
  );
}
