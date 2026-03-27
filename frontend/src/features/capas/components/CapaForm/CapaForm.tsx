import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, FormField } from '../../../../components/ui';
import type { CapaCategory, CapaFormValues, CapaPriority, CapaType } from '../../types';
import { INCIDENT_SEED } from '../../../incidents/types';
import { calculateDueDate, calculateVerificationDueDate, toDateInputValue } from '../../utils';
import styles from './CapaForm.module.css';

const TYPES: CapaType[] = ['Corrective', 'Preventive'];
const CATEGORIES: CapaCategory[] = [
  'Training', 'Procedure Change', 'Engineering Control', 'PPE', 'Equipment Modification', 'Policy Change', 'Other',
];
const PRIORITIES: CapaPriority[] = ['Critical', 'High', 'Medium', 'Low'];

const PRIORITY_LABELS: Record<CapaPriority, string> = {
  Critical: 'Critical — due in 7 days',
  High:     'High — due in 14 days',
  Medium:   'Medium — due in 30 days',
  Low:      'Low — due in 60 days',
};

const EMPTY: CapaFormValues = {
  type: '',
  category: '',
  description: '',
  assignedTo: '',
  priority: '',
  dueDate: '',
  verificationDueDate: '',
  verificationMethod: '',
  linkedIncidentIds: [],
  linkedInvestigationId: '',
};

interface CapaFormProps {
  initialValues?: Partial<CapaFormValues>;
  onSubmit?: (values: CapaFormValues) => void;
}

export function CapaForm({ initialValues, onSubmit }: CapaFormProps) {
  const navigate = useNavigate();
  const [values, setValues] = useState<CapaFormValues>({ ...EMPTY, ...initialValues });
  const [errors, setErrors] = useState<Partial<Record<keyof CapaFormValues, string>>>({});

  // Auto-calculate due dates when priority changes
  useEffect(() => {
    if (values.priority) {
      const p = values.priority as CapaPriority;
      const due = calculateDueDate(p);
      const verDue = calculateVerificationDueDate(p);
      setValues((prev) => ({
        ...prev,
        dueDate: toDateInputValue(due),
        verificationDueDate: toDateInputValue(verDue),
      }));
    }
  }, [values.priority]);

  function set<K extends keyof CapaFormValues>(field: K, value: CapaFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function toggleIncident(id: string) {
    setValues((prev) => ({
      ...prev,
      linkedIncidentIds: prev.linkedIncidentIds.includes(id)
        ? prev.linkedIncidentIds.filter((i) => i !== id)
        : [...prev.linkedIncidentIds, id],
    }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!values.type)        next.type        = 'CAPA type is required.';
    if (!values.category)    next.category    = 'Category is required.';
    if (!values.description.trim()) next.description = 'Description is required.';
    if (!values.assignedTo.trim()) next.assignedTo = 'Assignee is required.';
    if (!values.priority)   next.priority    = 'Priority is required.';
    if (!values.verificationMethod.trim()) next.verificationMethod = 'Verification method is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.(values);
    navigate('/app/capas');
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>CAPA Details</h2>
        <div className={styles.grid}>
          <FormField label="CAPA Type" required error={errors.type}>
            {(id) => (
              <select id={id} className="lyon-input" value={values.type} onChange={(e) => set('type', e.target.value as CapaType)}>
                <option value="">Select type…</option>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
          </FormField>

          <FormField label="Category" required error={errors.category}>
            {(id) => (
              <select id={id} className="lyon-input" value={values.category} onChange={(e) => set('category', e.target.value as CapaCategory)}>
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </FormField>

          <FormField label="Priority" required error={errors.priority}>
            {(id) => (
              <select id={id} className="lyon-input" value={values.priority} onChange={(e) => set('priority', e.target.value as CapaPriority)}>
                <option value="">Select priority…</option>
                {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
            )}
          </FormField>

          <FormField label="Assigned To" required error={errors.assignedTo}>
            {(id) => (
              <input id={id} type="text" className="lyon-input" placeholder="Name of assignee…" value={values.assignedTo} onChange={(e) => set('assignedTo', e.target.value)} />
            )}
          </FormField>

          <FormField label="Action Due Date" required>
            {(id) => (
              <input id={id} type="date" className="lyon-input" value={values.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
            )}
          </FormField>

          <FormField label="Verification Due Date">
            {(id) => (
              <input id={id} type="date" className="lyon-input" value={values.verificationDueDate} onChange={(e) => set('verificationDueDate', e.target.value)} />
            )}
          </FormField>
        </div>

        <div className={styles.fullField}>
          <FormField label="Description" required error={errors.description}>
            {(id) => (
              <textarea id={id} className="lyon-input" rows={4} placeholder="Describe the corrective or preventive action in detail…" value={values.description} onChange={(e) => set('description', e.target.value)} />
            )}
          </FormField>
        </div>

        <div className={styles.fullField}>
          <FormField label="Verification Method" required error={errors.verificationMethod}>
            {(id) => (
              <textarea id={id} className="lyon-input" rows={3} placeholder="How will effectiveness be measured and verified…" value={values.verificationMethod} onChange={(e) => set('verificationMethod', e.target.value)} />
            )}
          </FormField>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Linked Incidents</h2>
        <p className={styles.sectionHint}>Select all incidents this CAPA addresses.</p>
        <div className={styles.incidentList}>
          {INCIDENT_SEED.map((inc) => (
            <label key={inc.id} className={`${styles.incidentRow} ${values.linkedIncidentIds.includes(inc.id) ? styles.incidentChecked : ''}`}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={values.linkedIncidentIds.includes(inc.id)}
                onChange={() => toggleIncident(inc.id)}
              />
              <div className={styles.incidentInfo}>
                <span className={styles.incidentNum}>{inc.incidentNumber}</span>
                <span className={styles.incidentDesc}>{inc.incidentType} · {inc.division || 'No Division'} · {inc.severity || 'No Severity'}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={() => navigate('/app/capas')}>Cancel</Button>
        <Button type="submit" variant="accent">Create CAPA</Button>
      </div>
    </form>
  );
}
