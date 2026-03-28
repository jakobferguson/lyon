import { useState } from 'react';
import { Button } from '../../../../components/ui';
import type { FiveWhyStep, InvestigationStatus } from '../../types';
import styles from './FiveWhyBuilder.module.css';

interface FiveWhyBuilderProps {
  steps: FiveWhyStep[];
  rootCauseSummary: string;
  status: InvestigationStatus;
}

const MIN_STEPS = 3;

function generateId() {
  return `fw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function FiveWhyStepCard({
  step,
  index,
  total,
  isLast,
  readonly,
  onChange,
  onRemove,
}: {
  step: FiveWhyStep;
  index: number;
  total: number;
  isLast: boolean;
  readonly: boolean;
  onChange: (updated: FiveWhyStep) => void;
  onRemove: () => void;
}) {
  return (
    <div className={styles.stepWrapper}>
      <div className={styles.stepCard}>
        <div className={styles.stepHeader}>
          <span className={styles.stepNumber}>Why #{index + 1}</span>
          {!readonly && total > MIN_STEPS && (
            <button
              type="button"
              className={styles.removeBtn}
              onClick={onRemove}
              aria-label={`Remove Why #${index + 1}`}
            >
              ✕
            </button>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor={`why-${step.id}`}>
            Why question
          </label>
          {readonly ? (
            <p className={styles.readonlyText}>{step.why || <em className={styles.empty}>No question recorded.</em>}</p>
          ) : (
            <input
              id={`why-${step.id}`}
              type="text"
              className="lyon-input"
              placeholder="Ask why this happened…"
              value={step.why}
              onChange={(e) => onChange({ ...step, why: e.target.value })}
            />
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor={`answer-${step.id}`}>
            Answer
          </label>
          {readonly ? (
            <p className={styles.readonlyText}>{step.answer || <em className={styles.empty}>No answer recorded.</em>}</p>
          ) : (
            <textarea
              id={`answer-${step.id}`}
              className="lyon-input"
              rows={2}
              placeholder="What is the answer to this why…"
              value={step.answer}
              onChange={(e) => onChange({ ...step, answer: e.target.value })}
            />
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor={`evidence-${step.id}`}>
            Supporting evidence
            <span className={styles.optional}> (optional)</span>
          </label>
          {readonly ? (
            step.evidence ? (
              <p className={styles.readonlyText}>{step.evidence}</p>
            ) : (
              <p className={styles.empty}>No supporting evidence noted.</p>
            )
          ) : (
            <textarea
              id={`evidence-${step.id}`}
              className="lyon-input"
              rows={2}
              placeholder="Documents reviewed, witness accounts, photos referenced…"
              value={step.evidence}
              onChange={(e) => onChange({ ...step, evidence: e.target.value })}
            />
          )}
        </div>

        {isLast && (
          <div className={styles.rootCauseTag} aria-label="This is the root cause step">
            Root Cause
          </div>
        )}
      </div>

      {!isLast && (
        <div className={styles.connector} aria-hidden="true">
          <div className={styles.connectorLine} />
          <div className={styles.connectorArrow}>▼</div>
        </div>
      )}
    </div>
  );
}

export function FiveWhyBuilder({ steps: initialSteps, rootCauseSummary: initialSummary, status }: FiveWhyBuilderProps) {
  const readonly = status === 'Approved';
  const [steps, setSteps] = useState<FiveWhyStep[]>(
    initialSteps.length >= MIN_STEPS
      ? initialSteps
      : [
          ...initialSteps,
          ...Array.from({ length: MIN_STEPS - initialSteps.length }, () => ({
            id: generateId(),
            why: '',
            answer: '',
            evidence: '',
          })),
        ],
  );
  const [rootCauseSummary, setRootCauseSummary] = useState(initialSummary);
  const [saved, setSaved] = useState(false);

  function handleChange(index: number, updated: FiveWhyStep) {
    setSteps((prev) => prev.map((s, i) => (i === index ? updated : s)));
    setSaved(false);
  }

  function addStep() {
    setSteps((prev) => [...prev, { id: generateId(), why: '', answer: '', evidence: '' }]);
    setSaved(false);
  }

  function removeStep(index: number) {
    if (steps.length <= MIN_STEPS) return;
    setSteps((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
  }

  const lastFinalAnswer = steps[steps.length - 1]?.answer;

  return (
    <div className={styles.builder}>
      <div className={styles.builderHeader}>
        <div>
          <h3 className={styles.builderTitle}>5-Why Analysis</h3>
          <p className={styles.builderSubtitle}>
            Minimum {MIN_STEPS} levels required. The final answer becomes the root cause.
          </p>
        </div>
        {!readonly && (
          <div className={styles.headerActions}>
            {saved && <span className={styles.savedIndicator}>Saved</span>}
            <Button variant="secondary" size="sm" onClick={addStep}>
              + Add Why
            </Button>
            <Button variant="accent" size="sm" onClick={handleSave}>
              Save Analysis
            </Button>
          </div>
        )}
      </div>

      <div className={styles.chain}>
        {steps.map((step, index) => (
          <FiveWhyStepCard
            key={step.id}
            step={step}
            index={index}
            total={steps.length}
            isLast={index === steps.length - 1}
            readonly={readonly}
            onChange={(updated) => handleChange(index, updated)}
            onRemove={() => removeStep(index)}
          />
        ))}
      </div>

      <div className={styles.rootCauseSection}>
        <h4 className={styles.rootCauseTitle}>Root Cause Summary</h4>
        <p className={styles.rootCauseHint}>
          Populated from the final answer above. Edit to add context or narrative.
        </p>
        {readonly ? (
          <p className={styles.readonlyText}>
            {rootCauseSummary || lastFinalAnswer || <em className={styles.empty}>No root cause summary recorded.</em>}
          </p>
        ) : (
          <textarea
            className="lyon-input"
            rows={3}
            value={rootCauseSummary || lastFinalAnswer}
            onChange={(e) => { setRootCauseSummary(e.target.value); setSaved(false); }}
            placeholder="Summarize the root cause…"
          />
        )}
      </div>
    </div>
  );
}
