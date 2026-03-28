import { useState } from 'react';
import { Button, Modal } from '../../../../components/ui';
import type { InvestigationStatus, WitnessStatement } from '../../types';
import { formatDateOnly, formatDateShort } from '../../utils';
import styles from './WitnessStatementForm.module.css';

interface WitnessStatementFormProps {
  statements: WitnessStatement[];
  status: InvestigationStatus;
}

interface NewStatementFormValues {
  witnessName: string;
  jobTitle: string;
  employer: string;
  phone: string;
  statementText: string;
  collectionDate: string;
}

const EMPTY_FORM: NewStatementFormValues = {
  witnessName: '',
  jobTitle: '',
  employer: '',
  phone: '',
  statementText: '',
  collectionDate: new Date().toISOString().split('T')[0],
};

function StatementCard({ statement, index }: { statement: WitnessStatement; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <div className={styles.statementCard}>
      <button
        type="button"
        className={styles.statementHeader}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <div className={styles.statementMeta}>
          <span className={styles.witnessName}>{statement.witnessName}</span>
          <span className={styles.witnessSub}>{statement.jobTitle}{statement.employer ? ` · ${statement.employer}` : ''}</span>
        </div>
        <div className={styles.statementRight}>
          <span className={styles.collectionDate}>{formatDateOnly(statement.collectionDate)}</span>
          <span className={styles.expandIcon} aria-hidden="true">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className={styles.statementBody}>
          <blockquote className={styles.statementText}>
            {statement.statementText}
          </blockquote>
          <div className={styles.statementFooter}>
            <span>Collected by: <strong>{statement.collectedBy}</strong></span>
            <span>Submitted: {formatDateShort(statement.submittedAt)}</span>
            <span className={styles.immutableNote}>This statement is immutable after submission.</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function WitnessStatementForm({ statements: initialStatements, status }: WitnessStatementFormProps) {
  const readonly = status === 'Approved';
  const [statements, setStatements] = useState<WitnessStatement[]>(initialStatements);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<NewStatementFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof NewStatementFormValues, string>>>({});

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.witnessName.trim()) next.witnessName = 'Witness name is required.';
    if (!form.statementText.trim()) next.statementText = 'Statement text is required.';
    if (!form.collectionDate) next.collectionDate = 'Collection date is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    const newStatement: WitnessStatement = {
      id: `ws-${Date.now()}`,
      witnessName: form.witnessName.trim(),
      jobTitle: form.jobTitle.trim(),
      employer: form.employer.trim(),
      phone: form.phone.trim(),
      statementText: form.statementText.trim(),
      collectionDate: form.collectionDate,
      collectedBy: 'Current User',
      submittedAt: new Date().toISOString(),
    };

    setStatements((prev) => [...prev, newStatement]);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(false);
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(false);
  }

  function set(field: keyof NewStatementFormValues, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Witness Statements</h3>
          <p className={styles.subtitle}>
            {statements.length} statement{statements.length !== 1 ? 's' : ''} on record. Statements cannot be edited after submission.
          </p>
        </div>
        {!readonly && (
          <Button variant="accent" size="sm" onClick={() => setModalOpen(true)}>
            + Add Statement
          </Button>
        )}
      </div>

      {statements.length === 0 ? (
        <p className={styles.empty}>No witness statements have been recorded for this investigation.</p>
      ) : (
        <div className={styles.list}>
          {statements.map((s, i) => (
            <StatementCard key={s.id} statement={s} index={i} />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={handleClose} title="Add Witness Statement" size="lg">
        <div className={styles.modalForm}>
          <div className={styles.modalGrid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="ws-name">
                Witness Name <span className={styles.required}>*</span>
              </label>
              <input
                id="ws-name"
                type="text"
                className="lyon-input"
                value={form.witnessName}
                onChange={(e) => set('witnessName', e.target.value)}
              />
              {errors.witnessName && <span className={styles.fieldError}>{errors.witnessName}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ws-title">Job Title</label>
              <input
                id="ws-title"
                type="text"
                className="lyon-input"
                value={form.jobTitle}
                onChange={(e) => set('jobTitle', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ws-employer">Employer</label>
              <input
                id="ws-employer"
                type="text"
                className="lyon-input"
                value={form.employer}
                onChange={(e) => set('employer', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ws-phone">Phone</label>
              <input
                id="ws-phone"
                type="tel"
                className="lyon-input"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ws-date">
                Collection Date <span className={styles.required}>*</span>
              </label>
              <input
                id="ws-date"
                type="date"
                className="lyon-input"
                value={form.collectionDate}
                onChange={(e) => set('collectionDate', e.target.value)}
              />
              {errors.collectionDate && <span className={styles.fieldError}>{errors.collectionDate}</span>}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ws-statement">
              Statement <span className={styles.required}>*</span>
            </label>
            <textarea
              id="ws-statement"
              className="lyon-input"
              rows={6}
              placeholder="Record the witness's account in their own words…"
              value={form.statementText}
              onChange={(e) => set('statementText', e.target.value)}
            />
            {errors.statementText && <span className={styles.fieldError}>{errors.statementText}</span>}
          </div>

          <p className={styles.immutableWarning}>
            Once submitted, this statement cannot be edited. To correct a statement, a new entry referencing the original must be added.
          </p>

          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="accent" onClick={handleSubmit}>Submit Statement</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
