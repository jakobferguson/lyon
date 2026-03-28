import { useState } from 'react';
import { RAILROAD_SEED, type Railroad } from '../types';
import type { IncidentType } from '../../incidents/types';
import styles from './AdminRailroadsRoute.module.css';

const INCIDENT_TYPES: IncidentType[] = [
  'Injury', 'Near Miss', 'Property Damage', 'Environmental', 'Vehicle', 'Fire', 'Utility Strike',
];

const EMPTY_RAILROAD: Omit<Railroad, 'id'> = {
  name: '',
  shortCode: '',
  rules: {},
};

export function AdminRailroadsRoute() {
  const [railroads, setRailroads] = useState<Railroad[]>(RAILROAD_SEED);
  const [editing, setEditing] = useState<Railroad | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Omit<Railroad, 'id'>>(EMPTY_RAILROAD);

  function openNew() {
    setIsNew(true);
    setEditing(null);
    setForm(EMPTY_RAILROAD);
  }

  function openEdit(rr: Railroad) {
    setEditing(rr);
    setIsNew(false);
    setForm({ name: rr.name, shortCode: rr.shortCode, rules: { ...rr.rules } });
  }

  function handleCancel() {
    setEditing(null);
    setIsNew(false);
  }

  function handleSave() {
    if (!form.name.trim() || !form.shortCode.trim()) return;
    if (isNew) {
      const newRR: Railroad = { ...form, id: crypto.randomUUID() };
      setRailroads((prev) => [...prev, newRR]);
    } else if (editing) {
      setRailroads((prev) =>
        prev.map((r) => (r.id === editing.id ? { ...r, ...form } : r)),
      );
    }
    handleCancel();
  }

  function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this railroad? This action cannot be undone.')) return;
    setRailroads((prev) => prev.filter((r) => r.id !== id));
  }

  function setRule(type: IncidentType, val: string) {
    const n = parseInt(val, 10);
    setForm((f) => ({
      ...f,
      rules: { ...f.rules, [type]: isNaN(n) ? undefined : n },
    }));
  }

  const showModal = isNew || editing !== null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Railroads</h1>
          <p className={styles.subtitle}>Manage railroad clients and notification deadline rules.</p>
        </div>
        <button className={styles.addBtn} onClick={openNew}>+ Add Railroad</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              {INCIDENT_TYPES.map((t) => <th key={t}>{t} (hrs)</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {railroads.map((rr) => (
              <tr key={rr.id}>
                <td className={styles.nameCell}>{rr.name}</td>
                <td><span className={styles.code}>{rr.shortCode}</span></td>
                {INCIDENT_TYPES.map((t) => (
                  <td key={t}>{rr.rules[t] ?? '—'}</td>
                ))}
                <td>
                  <div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => openEdit(rr)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(rr.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{isNew ? 'Add Railroad' : 'Edit Railroad'}</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Railroad Name</label>
              <input
                className={styles.input}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. BNSF Railway"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Short Code</label>
              <input
                className={styles.input}
                value={form.shortCode}
                onChange={(e) => setForm((f) => ({ ...f, shortCode: e.target.value }))}
                placeholder="e.g. BNSF"
                maxLength={6}
              />
            </div>

            <div className={styles.rulesSection}>
              <p className={styles.rulesLabel}>Notification Deadlines (hours)</p>
              <div className={styles.rulesGrid}>
                {INCIDENT_TYPES.map((t) => (
                  <div key={t} className={styles.ruleRow}>
                    <label className={styles.ruleLabel}>{t}</label>
                    <input
                      type="number"
                      min="0"
                      className={styles.ruleInput}
                      value={form.rules[t] ?? ''}
                      onChange={(e) => setRule(t, e.target.value)}
                      placeholder="hrs"
                    />
                  </div>
                ))}
              </div>
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
