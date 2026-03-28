import { useState } from 'react';
import { Button } from '../../../../components/ui';
import type { ContributingFactor, FactorCategory, FactorType, InvestigationStatus } from '../../types';
import { FACTOR_LIBRARY } from '../../types';
import styles from './ContributingFactorForm.module.css';

interface ContributingFactorFormProps {
  factors: ContributingFactor[];
  status: InvestigationStatus;
}

const CATEGORY_ICONS: Record<FactorCategory, string> = {
  People:        '👤',
  Equipment:     '🔧',
  Environmental: '🌦',
  Procedural:    '📋',
  Management:    '🏢',
};

export function ContributingFactorForm({ factors: initialFactors, status }: ContributingFactorFormProps) {
  const readonly = status === 'Approved';
  const [selected, setSelected] = useState<Map<string, ContributingFactor>>(
    () => new Map(initialFactors.map((f) => [f.factorId, f])),
  );
  const [saved, setSaved] = useState(false);
  const [primaryError, setPrimaryError] = useState(false);

  const primaryId = [...selected.values()].find((f) => f.isPrimary)?.factorId ?? null;

  function toggle(factor: FactorType) {
    if (readonly) return;
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(factor.id)) {
        const wasPrimary = next.get(factor.id)?.isPrimary;
        next.delete(factor.id);
        if (wasPrimary) setPrimaryError(false);
      } else {
        next.set(factor.id, {
          factorId: factor.id,
          factorName: factor.name,
          category: factor.category,
          isPrimary: false,
          notes: '',
        });
      }
      setSaved(false);
      return next;
    });
  }

  function setPrimary(factorId: string) {
    if (readonly) return;
    setSelected((prev) => {
      const next = new Map(prev);
      for (const [id, factor] of next) {
        next.set(id, { ...factor, isPrimary: id === factorId });
      }
      setSaved(false);
      setPrimaryError(false);
      return next;
    });
  }

  function updateNotes(factorId: string, notes: string) {
    setSelected((prev) => {
      const next = new Map(prev);
      const existing = next.get(factorId);
      if (existing) next.set(factorId, { ...existing, notes });
      setSaved(false);
      return next;
    });
  }

  function handleSave() {
    if (selected.size > 0 && primaryId === null) {
      setPrimaryError(true);
      return;
    }
    setPrimaryError(false);
    setSaved(true);
  }

  const selectedList = [...selected.values()];

  return (
    <div className={styles.form}>
      <div className={styles.formHeader}>
        <div>
          <h3 className={styles.title}>Contributing Factors</h3>
          <p className={styles.subtitle}>
            Select all applicable factors. One primary factor is required.
          </p>
        </div>
        {!readonly && (
          <div className={styles.headerActions}>
            {saved && <span className={styles.savedIndicator}>Saved</span>}
            <Button variant="accent" size="sm" onClick={handleSave}>
              Save Factors
            </Button>
          </div>
        )}
      </div>

      {primaryError && (
        <p className={styles.error} role="alert">
          Please designate one factor as the primary contributing factor.
        </p>
      )}

      {readonly ? (
        /* Read-only view */
        selectedList.length === 0 ? (
          <p className={styles.noFactors}>No contributing factors recorded.</p>
        ) : (
          <div className={styles.readonlyList}>
            {selectedList.map((f) => (
              <div key={f.factorId} className={`${styles.readonlyItem} ${f.isPrimary ? styles.primaryItem : ''}`}>
                <div className={styles.readonlyItemHeader}>
                  <span className={styles.categoryTag}>{CATEGORY_ICONS[f.category]} {f.category}</span>
                  <span className={styles.factorName}>{f.factorName}</span>
                  {f.isPrimary && <span className={styles.primaryBadge}>Primary</span>}
                </div>
                {f.notes && <p className={styles.readonlyNotes}>{f.notes}</p>}
              </div>
            ))}
          </div>
        )
      ) : (
        /* Interactive grid */
        <div className={styles.categories}>
          {FACTOR_LIBRARY.map(({ category, factors }) => (
            <div key={category} className={styles.categoryBlock}>
              <h4 className={styles.categoryTitle}>
                <span className={styles.categoryIcon}>{CATEGORY_ICONS[category]}</span>
                {category}
              </h4>
              <div className={styles.factorGrid}>
                {factors.map((factor) => {
                  const isChecked = selected.has(factor.id);
                  const entry = selected.get(factor.id);
                  return (
                    <div key={factor.id} className={`${styles.factorItem} ${isChecked ? styles.factorChecked : ''}`}>
                      <label className={styles.factorLabel}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={isChecked}
                          onChange={() => toggle(factor)}
                        />
                        <span className={styles.factorName}>{factor.name}</span>
                      </label>

                      {isChecked && (
                        <div className={styles.factorDetail}>
                          <div className={styles.primaryRow}>
                            <label className={styles.primaryLabel}>
                              <input
                                type="radio"
                                name="primary-factor"
                                checked={primaryId === factor.id}
                                onChange={() => setPrimary(factor.id)}
                                className={styles.radio}
                              />
                              Set as primary factor
                            </label>
                            {primaryId === factor.id && (
                              <span className={styles.primaryBadge}>Primary</span>
                            )}
                          </div>
                          <textarea
                            className="lyon-input"
                            rows={2}
                            placeholder="Notes on this factor (optional)…"
                            value={entry?.notes ?? ''}
                            onChange={(e) => updateNotes(factor.id, e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
