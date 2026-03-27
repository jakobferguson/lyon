import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormField, Button } from '../../../../components/ui';
import { LocationPicker } from '../LocationPicker/LocationPicker';
import { PhotoUpload } from '../PhotoUpload/PhotoUpload';
import { OshaWizard } from '../OshaWizard/OshaWizard';
import { RailroadNotificationForm } from '../RailroadNotificationForm/RailroadNotificationForm';
import { InjuredPersonForm } from '../InjuredPersonForm/InjuredPersonForm';
import { CompletionBar } from '../CompletionBar/CompletionBar';
import type { IncidentFormValues, IncidentType, Severity, ShiftType, WeatherCondition } from '../../types';
import type { Division } from '../../../../types';
import styles from './IncidentForm.module.css';

const INCIDENT_TYPES: IncidentType[] = ['Injury','Near Miss','Property Damage','Environmental','Vehicle','Fire','Utility Strike'];
const SEVERITIES: Severity[] = ['Fatality','Lost Time','Medical Treatment','First Aid','Near Miss'];
const SHIFTS: ShiftType[] = ['Day','Night','Swing'];
const WEATHERS: WeatherCondition[] = ['Clear','Rain','Snow','Ice','Fog','Wind','Extreme Heat','Extreme Cold'];
const DIVISIONS: Division[] = ['HCC','HRSI','HSI','HTI','HTSI','Herzog Energy','Green Group'];

interface Section {
  id: string;
  label: string;
  content: React.ReactNode;
}

// ── Individual section content components ────────────────────────────────

function QuickReportSection() {
  const { register, formState: { errors } } = useFormContext<IncidentFormValues>();
  return (
    <div className={styles.sectionGrid}>
      <FormField label="Incident Type" required error={errors.incidentType?.message}>
        {(id) => (
          <select id={id} className="lyon-input" {...register('incidentType', { required: 'Incident type is required.' })}>
            <option value="">Select type…</option>
            {INCIDENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
      </FormField>

      <FormField label="Date / Time" required error={errors.dateTime?.message}>
        {(id) => (
          <input
            id={id}
            type="datetime-local"
            className="lyon-input"
            {...register('dateTime', { required: 'Date and time are required.' })}
          />
        )}
      </FormField>

      <div className={styles.fullWidth}>
        <FormField label="Location" required error={errors.location?.textDescription?.message}>
          {() => <LocationPicker />}
        </FormField>
      </div>

      <div className={styles.fullWidth}>
        <FormField label="Description" required error={errors.description?.message}>
          {(id) => (
            <textarea
              id={id}
              className="lyon-input"
              rows={4}
              placeholder="Describe what happened in detail…"
              {...register('description', { required: 'Description is required.' })}
            />
          )}
        </FormField>
      </div>
    </div>
  );
}

function DetailsSection() {
  const { register, control } = useFormContext<IncidentFormValues>();
  const onRailroad = useWatch({ control, name: 'onRailroadProperty' });

  return (
    <div className={styles.sectionGrid}>
      <FormField label="Division">
        {(id) => (
          <select id={id} className="lyon-input" {...register('division')}>
            <option value="">Select division…</option>
            {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
      </FormField>

      <FormField label="Project / Job Site">
        {(id) => (
          <input id={id} type="text" className="lyon-input" placeholder="Project name or job number" {...register('project')} />
        )}
      </FormField>

      <FormField label="Severity">
        {(id) => (
          <select id={id} className="lyon-input" {...register('severity')}>
            <option value="">Select severity…</option>
            {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </FormField>

      <FormField label="Potential Severity">
        {(id) => (
          <select id={id} className="lyon-input" {...register('potentialSeverity')}>
            <option value="">Select potential severity…</option>
            {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </FormField>

      <FormField label="Shift">
        {(id) => (
          <select id={id} className="lyon-input" {...register('shift')}>
            <option value="">Select shift…</option>
            {SHIFTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </FormField>

      <FormField label="Weather Conditions">
        {(id) => (
          <select id={id} className="lyon-input" {...register('weather')}>
            <option value="">Select weather…</option>
            {WEATHERS.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        )}
      </FormField>

      <div className={styles.fullWidth}>
        <FormField label="Immediate Actions Taken">
          {(id) => (
            <textarea id={id} className="lyon-input" rows={3} placeholder="What was done on-scene immediately after the incident?" {...register('immediateActions')} />
          )}
        </FormField>
      </div>

      <div className={styles.fullWidth}>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" {...register('onRailroadProperty')} />
          <span>On Railroad Property</span>
          <span className={styles.checkHint}>Auto-checked when GPS falls within a railroad geofence; manually adjustable.</span>
        </label>
      </div>

      {onRailroad && (
        <div className={styles.fullWidth}>
          <RailroadNotificationForm />
        </div>
      )}
    </div>
  );
}

function InjuredSection() {
  const incidentType = useWatch({ name: 'incidentType' });
  if (incidentType !== 'Injury') {
    return (
      <p className={styles.naMessage}>
        This section applies to Injury incidents only. Change the incident type to Injury to enable.
      </p>
    );
  }
  return <InjuredPersonForm />;
}

function OshaSection() {
  return (
    <div>
      <p className={styles.sectionDesc}>
        Use the wizard below to determine OSHA recordability per 29 CFR 1904.
        The system will set the recordable and DART flags automatically based on your answers.
      </p>
      <OshaWizard />
    </div>
  );
}

function PhotoSection() {
  return <PhotoUpload />;
}

// ── Accordion/Stepper shell ──────────────────────────────────────────────

export function IncidentForm() {
  const { handleSubmit } = useFormContext<IncidentFormValues>();
  const [openSection, setOpenSection] = useState<string>('quick');
  const [submitted, setSubmitted]     = useState(false);

  const sections: Section[] = [
    { id: 'quick',    label: '1. Quick Report',          content: <QuickReportSection /> },
    { id: 'details',  label: '2. Full Report Details',   content: <DetailsSection /> },
    { id: 'injured',  label: '3. Injured Person',        content: <InjuredSection /> },
    { id: 'osha',     label: '4. OSHA Recordability',    content: <OshaSection /> },
    { id: 'photos',   label: '5. Photos',                content: <PhotoSection /> },
  ];

  function onSubmit() {
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className={styles.successCard}>
        <span className={styles.successIcon} aria-hidden="true">✅</span>
        <h2 className={styles.successTitle}>Incident Reported</h2>
        <p className={styles.successMsg}>
          Your incident report has been submitted successfully. An incident number will be assigned once the backend is connected.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.completionWrap}>
        <CompletionBar />
      </div>

      {/* Accordion (desktop) / Stepper (mobile) */}
      <div className={styles.sections}>
        {sections.map((sec) => {
          const isOpen = openSection === sec.id;
          return (
            <div key={sec.id} className={`${styles.section} ${isOpen ? styles.sectionOpen : ''}`}>
              <button
                type="button"
                className={styles.sectionHeader}
                onClick={() => setOpenSection(isOpen ? '' : sec.id)}
                aria-expanded={isOpen}
              >
                <span className={styles.sectionLabel}>{sec.label}</span>
                <span className={styles.chevron} aria-hidden="true">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className={styles.sectionBody}>
                  {sec.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.formActions}>
        <Button type="button" variant="secondary">Save Draft</Button>
        <Button type="submit" variant="accent">Submit Report</Button>
      </div>
    </form>
  );
}
