import { useState } from 'react';
import { Button, FormField } from '../../../../components/ui';
import { INCIDENT_SEED } from '../../../incidents/types';
import type { RecurrenceLink, SimilarityType } from '../../types';
import { SIMILARITY_TYPES } from '../../types';
import styles from './RecurrenceLinkForm.module.css';

interface RecurrenceLinkFormProps {
  currentIncidentId: string;
  existingLinks: RecurrenceLink[];
  onLink: (link: RecurrenceLink) => void;
}

export function RecurrenceLinkForm({ currentIncidentId, existingLinks, onLink }: RecurrenceLinkFormProps) {
  const [open, setOpen]               = useState(false);
  const [targetId, setTargetId]       = useState('');
  const [selected, setSelected]       = useState<SimilarityType[]>([]);
  const [notes, setNotes]             = useState('');
  const [errors, setErrors]           = useState<{ target?: string; types?: string }>({});

  const linkedIds = existingLinks.flatMap((l) => [l.incidentAId, l.incidentBId]).filter((i) => i !== currentIncidentId);
  const available = INCIDENT_SEED.filter((i) => i.id !== currentIncidentId && !linkedIds.includes(i.id));

  function toggleType(t: SimilarityType) {
    setSelected((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }

  function validate() {
    const e: typeof errors = {};
    if (!targetId)         e.target = 'Select an incident to link.';
    if (selected.length === 0) e.types = 'Select at least one similarity type.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const link: RecurrenceLink = {
      id: `rec-${Date.now()}`,
      incidentAId: currentIncidentId,
      incidentBId: targetId,
      similarityTypes: selected,
      notes,
      linkedBy: 'T. Griffith',
      linkedAt: new Date().toISOString(),
    };
    onLink(link);
    setOpen(false);
    setTargetId('');
    setSelected([]);
    setNotes('');
  }

  if (!open) {
    return (
      <Button variant="accent" onClick={() => setOpen(true)}>
        + Link Recurrent Incident
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <h3 className={styles.formTitle}>Link Recurrent Incident</h3>

      <FormField label="Incident to Link" required error={errors.target}>
        {(id) => (
          <select
            id={id}
            className="lyon-input"
            value={targetId}
            onChange={(e) => { setTargetId(e.target.value); if (errors.target) setErrors((p) => ({ ...p, target: undefined })); }}
          >
            <option value="">Select incident…</option>
            {available.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {inc.incidentNumber} — {inc.incidentType} ({inc.division})
              </option>
            ))}
          </select>
        )}
      </FormField>

      <div className={styles.typesField}>
        <label className={styles.typesLabel}>
          Similarity Types <span aria-hidden="true" className={styles.required}>*</span>
        </label>
        {errors.types && <span className={styles.error}>{errors.types}</span>}
        <div className={styles.typesGrid}>
          {SIMILARITY_TYPES.map((t) => (
            <label key={t} className={`${styles.typeOption} ${selected.includes(t) ? styles.typeChecked : ''}`}>
              <input
                type="checkbox"
                checked={selected.includes(t)}
                onChange={() => toggleType(t)}
                style={{ accentColor: 'var(--color-accent, #c8a45a)' }}
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      <FormField label="Notes">
        {(id) => (
          <textarea
            id={id}
            className="lyon-input"
            rows={3}
            placeholder="Explain the recurrence pattern…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        )}
      </FormField>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
        <Button type="submit" variant="accent">Link Incident</Button>
      </div>
    </form>
  );
}
