import { useState } from 'react';
import { GEOFENCE_SEED, RAILROAD_SEED, type GeofenceZone } from '../types';
import styles from './AdminGeofencesRoute.module.css';

const EMPTY: Omit<GeofenceZone, 'id'> = {
  name: '',
  railroad: RAILROAD_SEED[0].shortCode,
  lat: 0,
  lng: 0,
  radiusMeters: 500,
};

export function AdminGeofencesRoute() {
  const [zones, setZones] = useState<GeofenceZone[]>(GEOFENCE_SEED);
  const [editing, setEditing] = useState<GeofenceZone | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Omit<GeofenceZone, 'id'>>(EMPTY);

  function openNew() {
    setIsNew(true);
    setEditing(null);
    setForm(EMPTY);
  }

  function openEdit(z: GeofenceZone) {
    setEditing(z);
    setIsNew(false);
    setForm({ name: z.name, railroad: z.railroad, lat: z.lat, lng: z.lng, radiusMeters: z.radiusMeters });
  }

  function handleCancel() {
    setEditing(null);
    setIsNew(false);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    if (isNew) {
      setZones((prev) => [...prev, { ...form, id: crypto.randomUUID() }]);
    } else if (editing) {
      setZones((prev) => prev.map((z) => (z.id === editing.id ? { ...z, ...form } : z)));
    }
    handleCancel();
  }

  function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this geofence zone? This action cannot be undone.')) return;
    setZones((prev) => prev.filter((z) => z.id !== id));
  }

  const showModal = isNew || editing !== null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Geofences</h1>
          <p className={styles.subtitle}>Configure radius-based geofence zones tied to railroad yards and worksites.</p>
        </div>
        <button className={styles.addBtn} onClick={openNew}>+ Add Zone</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Railroad</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Radius (m)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z.id}>
                <td className={styles.nameCell}>{z.name}</td>
                <td><span className={styles.code}>{z.railroad}</span></td>
                <td>{z.lat.toFixed(4)}</td>
                <td>{z.lng.toFixed(4)}</td>
                <td>{z.radiusMeters.toLocaleString()}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => openEdit(z)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(z.id)}>Delete</button>
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
            <h2 className={styles.modalTitle}>{isNew ? 'Add Geofence Zone' : 'Edit Geofence Zone'}</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Zone Name</label>
              <input
                className={styles.input}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Kansas City Yard"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Railroad</label>
              <select
                className={styles.input}
                value={form.railroad}
                onChange={(e) => setForm((f) => ({ ...f, railroad: e.target.value }))}
              >
                {RAILROAD_SEED.map((rr) => (
                  <option key={rr.id} value={rr.shortCode}>{rr.name} ({rr.shortCode})</option>
                ))}
              </select>
            </div>

            <div className={styles.coordRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  className={styles.input}
                  value={form.lat}
                  onChange={(e) => setForm((f) => ({ ...f, lat: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  className={styles.input}
                  value={form.lng}
                  onChange={(e) => setForm((f) => ({ ...f, lng: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Radius (meters)</label>
              <input
                type="number"
                min="1"
                className={styles.input}
                value={form.radiusMeters}
                onChange={(e) => setForm((f) => ({ ...f, radiusMeters: parseInt(e.target.value, 10) || 0 }))}
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
