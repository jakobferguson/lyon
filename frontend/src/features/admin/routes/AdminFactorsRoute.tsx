import { useState, useMemo } from 'react';
import { FACTOR_SEED, type FactorType } from '../types';
import styles from './AdminFactorsRoute.module.css';

const CATEGORIES = Array.from(new Set(FACTOR_SEED.map((f) => f.category)));

export function AdminFactorsRoute() {
  const [factors, setFactors] = useState<FactorType[]>(FACTOR_SEED);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(true);
  const [editing, setEditing] = useState<FactorType | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({ category: CATEGORIES[0], label: '' });

  const visible = useMemo(
    () =>
      factors.filter(
        (f) =>
          (filterCategory === 'all' || f.category === filterCategory) &&
          (showInactive || f.active),
      ),
    [factors, filterCategory, showInactive],
  );

  const grouped = useMemo(() => {
    const map: Record<string, FactorType[]> = {};
    for (const f of visible) {
      if (!map[f.category]) map[f.category] = [];
      map[f.category].push(f);
    }
    return map;
  }, [visible]);

  function openNew() {
    setIsNew(true);
    setEditing(null);
    setForm({ category: filterCategory !== 'all' ? filterCategory : CATEGORIES[0], label: '' });
  }

  function openEdit(f: FactorType) {
    setEditing(f);
    setIsNew(false);
    setForm({ category: f.category, label: f.label });
  }

  function handleCancel() {
    setEditing(null);
    setIsNew(false);
  }

  function handleSave() {
    if (!form.label.trim()) return;
    if (isNew) {
      setFactors((prev) => [
        ...prev,
        { id: `f-${Date.now()}`, category: form.category, label: form.label, active: true },
      ]);
    } else if (editing) {
      setFactors((prev) =>
        prev.map((f) =>
          f.id === editing.id ? { ...f, category: form.category, label: form.label } : f,
        ),
      );
    }
    handleCancel();
  }

  function toggleActive(id: string) {
    setFactors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f)),
    );
  }

  const showModal = isNew || editing !== null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Factor Types</h1>
          <p className={styles.subtitle}>Maintain the library of contributing factor categories and labels.</p>
        </div>
        <button className={styles.addBtn} onClick={openNew}>+ Add Factor</button>
      </div>

      <div className={styles.controls}>
        <select
          className={styles.select}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Show inactive
        </label>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className={styles.categoryBlock}>
          <h2 className={styles.categoryTitle}>{category}</h2>
          <div className={styles.factorList}>
            {items.map((f) => (
              <div key={f.id} className={`${styles.factorRow} ${!f.active ? styles.inactive : ''}`}>
                <span className={styles.factorLabel}>{f.label}</span>
                <div className={styles.factorActions}>
                  {!f.active && <span className={styles.inactiveBadge}>Inactive</span>}
                  <button className={styles.editBtn} onClick={() => openEdit(f)}>Edit</button>
                  <button
                    className={f.active ? styles.deactivateBtn : styles.activateBtn}
                    onClick={() => toggleActive(f.id)}
                  >
                    {f.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{isNew ? 'Add Factor Type' : 'Edit Factor Type'}</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Category</label>
              <select
                className={styles.select}
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Label</label>
              <input
                className={styles.input}
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Communication Failure"
              />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
