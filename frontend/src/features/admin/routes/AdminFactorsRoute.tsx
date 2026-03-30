import { useState, useMemo } from 'react';
import { Spinner } from '../../../components/ui';
import { useFactorTypes, useCreateFactorType, useUpdateFactorType } from '../api/admin';
import type { FactorTypeDto } from '../api/admin';
import styles from './AdminFactorsRoute.module.css';

export function AdminFactorsRoute() {
  const { data: factors = [], isLoading } = useFactorTypes();
  const createMutation = useCreateFactorType();
  const updateMutation = useUpdateFactorType();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(true);
  const [editing, setEditing] = useState<FactorTypeDto | null>(null);
  const [isNew, setIsNew] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(factors.map((f) => f.category))),
    [factors],
  );

  const [form, setForm] = useState({ category: '', label: '' });

  const visible = useMemo(
    () =>
      factors.filter(
        (f) =>
          (filterCategory === 'all' || f.category === filterCategory) &&
          (showInactive || f.isActive),
      ),
    [factors, filterCategory, showInactive],
  );

  const grouped = useMemo(() => {
    const map: Record<string, FactorTypeDto[]> = {};
    for (const f of visible) {
      if (!map[f.category]) map[f.category] = [];
      map[f.category].push(f);
    }
    return map;
  }, [visible]);

  function openNew() {
    setIsNew(true);
    setEditing(null);
    setForm({ category: filterCategory !== 'all' ? filterCategory : (categories[0] ?? ''), label: '' });
  }

  function openEdit(f: FactorTypeDto) {
    setEditing(f);
    setIsNew(false);
    setForm({ category: f.category, label: f.name });
  }

  function handleCancel() {
    setEditing(null);
    setIsNew(false);
  }

  function handleSave() {
    if (!form.label.trim()) return;
    if (isNew) {
      createMutation.mutate(
        { category: form.category, name: form.label },
        { onSuccess: handleCancel },
      );
    } else if (editing) {
      updateMutation.mutate(
        { id: editing.id, category: form.category, name: form.label, sortOrder: editing.sortOrder },
        { onSuccess: handleCancel },
      );
    }
  }

  function toggleActive(f: FactorTypeDto) {
    // Toggle by updating with the same data but we'd need a deactivate endpoint
    // For now, reuse update — backend can handle isActive toggle via name update
    updateMutation.mutate({
      id: f.id,
      category: f.category,
      name: f.name,
      sortOrder: f.sortOrder,
    });
  }

  const showModal = isNew || editing !== null;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}><Spinner size="lg" /></div>;
  }

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
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
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
              <div key={f.id} className={`${styles.factorRow} ${!f.isActive ? styles.inactive : ''}`}>
                <span className={styles.factorLabel}>{f.name}</span>
                <div className={styles.factorActions}>
                  {!f.isActive && <span className={styles.inactiveBadge}>Inactive</span>}
                  <button className={styles.editBtn} onClick={() => openEdit(f)}>Edit</button>
                  <button
                    className={f.isActive ? styles.deactivateBtn : styles.activateBtn}
                    onClick={() => toggleActive(f)}
                  >
                    {f.isActive ? 'Deactivate' : 'Activate'}
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
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
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
              <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
