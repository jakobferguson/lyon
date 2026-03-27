import { useState } from 'react';
import { SHIFT_SEED, type ShiftWindow } from '../types';
import styles from './AdminShiftsRoute.module.css';

const EMPTY: Omit<ShiftWindow, 'id'> = { name: '', start: '06:00', end: '14:00' };

export function AdminShiftsRoute() {
  const [shifts, setShifts] = useState<ShiftWindow[]>(SHIFT_SEED);
  const [editing, setEditing] = useState<ShiftWindow | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Omit<ShiftWindow, 'id'>>(EMPTY);

  function openNew() {
    setIsNew(true);
    setEditing(null);
    setForm(EMPTY);
  }

  function openEdit(s: ShiftWindow) {
    setEditing(s);
    setIsNew(false);
    setForm({ name: s.name, start: s.start, end: s.end });
  }

  function handleCancel() {
    setEditing(null);
    setIsNew(false);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    if (isNew) {
      setShifts((prev) => [...prev, { ...form, id: `sw-${Date.now()}` }]);
    } else if (editing) {
      setShifts((prev) =>
        prev.map((s) => (s.id === editing.id ? { ...s, ...form } : s)),
      );
    }
    handleCancel();
  }

  function handleDelete(id: string) {
    setShifts((prev) => prev.filter((s) => s.id !== id));
  }

  const showModal = isNew || editing !== null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Shift Windows</h1>
          <p className={styles.subtitle}>Define shift windows used during incident reporting.</p>
        </div>
        <button className={styles.addBtn} onClick={openNew}>+ Add Shift</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((s) => {
              const [sh, sm] = s.start.split(':').map(Number);
              const [eh, em] = s.end.split(':').map(Number);
              let mins = (eh * 60 + em) - (sh * 60 + sm);
              if (mins < 0) mins += 24 * 60;
              const dur = `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ''}`.trim();
              return (
                <tr key={s.id}>
                  <td className={styles.nameCell}>{s.name}</td>
                  <td>{s.start}</td>
                  <td>{s.end}</td>
                  <td>{dur}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => openEdit(s)}>Edit</button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(s.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{isNew ? 'Add Shift Window' : 'Edit Shift Window'}</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Shift Name</label>
              <input
                className={styles.input}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Day Shift"
              />
            </div>

            <div className={styles.timeRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Start Time</label>
                <input
                  type="time"
                  className={styles.input}
                  value={form.start}
                  onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>End Time</label>
                <input
                  type="time"
                  className={styles.input}
                  value={form.end}
                  onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
                />
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
