import { useState } from 'react';
import { MANAGED_USER_SEED, type ManagedUser } from '../types';
import type { Role, Division } from '../../../types';
import { DIVISIONS } from '../../../types';
import styles from './AdminUsersRoute.module.css';

const ROLES: Role[] = [
  'field_reporter', 'safety_coordinator', 'safety_manager',
  'project_manager', 'division_manager', 'executive', 'admin',
];

const ROLE_LABELS: Record<Role, string> = {
  field_reporter:     'Field Reporter',
  safety_coordinator: 'Safety Coordinator',
  safety_manager:     'Safety Manager',
  project_manager:    'Project Manager',
  division_manager:   'Division Manager',
  executive:          'Executive',
  admin:              'Admin',
};

export function AdminUsersRoute() {
  const [users, setUsers] = useState<ManagedUser[]>(MANAGED_USER_SEED);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [form, setForm] = useState<{ role: Role; division: Division | null }>({ role: 'field_reporter', division: null });

  function openEdit(u: ManagedUser) {
    setEditing(u);
    setForm({ role: u.role, division: u.division });
  }

  function handleCancel() {
    setEditing(null);
  }

  function handleSave() {
    if (!editing) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === editing.id ? { ...u, role: form.role, division: form.division } : u)),
    );
    handleCancel();
  }

  function toggleActive(id: string) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Users</h1>
          <p className={styles.subtitle}>Manage user accounts and assign roles and divisions.</p>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Division</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={!u.active ? styles.inactiveRow : ''}>
                <td className={styles.nameCell}>{u.name}</td>
                <td className={styles.emailCell}>{u.email}</td>
                <td>
                  <span className={`${styles.roleBadge} ${styles[`role_${u.role}`]}`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td>{u.division ?? <span className={styles.na}>—</span>}</td>
                <td>
                  {u.active
                    ? <span className={styles.activeTag}>Active</span>
                    : <span className={styles.inactiveTag}>Inactive</span>
                  }
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => openEdit(u)}>Edit</button>
                    <button
                      className={u.active ? styles.deactivateBtn : styles.activateBtn}
                      onClick={() => toggleActive(u.id)}
                    >
                      {u.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Edit User — {editing.name}</h2>

            <div className={styles.readonlyGroup}>
              <span className={styles.label}>Email</span>
              <span className={styles.readonlyValue}>{editing.email}</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Role</label>
              <select
                className={styles.select}
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
              >
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Division</label>
              <select
                className={styles.select}
                value={form.division ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, division: (e.target.value || null) as Division | null }))}
              >
                <option value="">— None —</option>
                {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
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
