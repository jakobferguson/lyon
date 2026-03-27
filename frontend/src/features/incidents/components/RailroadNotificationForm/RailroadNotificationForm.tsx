import { useFormContext, useWatch } from 'react-hook-form';
import { FormField } from '../../../../components/ui';
import type { IncidentFormValues, NotificationMethod } from '../../types';
import styles from './RailroadNotificationForm.module.css';

const RAILROADS = ['BNSF', 'UP', 'CSX', 'NS', 'CN', 'KCS', 'Other'];
const METHODS: NotificationMethod[] = ['Phone', 'Email', 'In-Person', 'Radio', 'Other'];

export function RailroadNotificationForm() {
  const { register, control, setValue, formState: { errors } } = useFormContext<IncidentFormValues>();
  const onRailroad = useWatch({ control, name: 'onRailroadProperty' });
  const wasNotified = useWatch({ control, name: 'railroadNotification.wasNotified' });

  if (!onRailroad) return null;

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.heading}>Railroad Client Notification</h3>

      <FormField label="Railroad Client" required error={errors.railroadClient?.message}>
        {(id) => (
          <select
            id={id}
            className="lyon-input"
            {...register('railroadClient', { required: 'Railroad client is required when on railroad property.' })}
          >
            <option value="">Select railroad…</option>
            {RAILROADS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        )}
      </FormField>

      <FormField label="Was Client Notified?" required>
        {() => (
          <div className={styles.radioGroup} role="radiogroup" aria-label="Was client notified">
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="yes"
                checked={wasNotified === true}
                onChange={() => setValue('railroadNotification.wasNotified', true, { shouldDirty: true })}
              />
              Yes
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="no"
                checked={wasNotified === false}
                onChange={() => setValue('railroadNotification.wasNotified', false, { shouldDirty: true })}
              />
              No
            </label>
          </div>
        )}
      </FormField>

      {wasNotified === true && (
        <>
          <FormField label="Notification Date / Time" required>
            {(id) => (
              <input
                id={id}
                type="datetime-local"
                className="lyon-input"
                {...register('railroadNotification.notificationDateTime')}
              />
            )}
          </FormField>

          <FormField label="Notification Method" required>
            {(id) => (
              <select id={id} className="lyon-input" {...register('railroadNotification.method')}>
                <option value="">Select method…</option>
                {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            )}
          </FormField>

          <div className={styles.row}>
            <FormField label="Person Notified (Name)">
              {(id) => (
                <input
                  id={id}
                  type="text"
                  className="lyon-input"
                  placeholder="Full name"
                  {...register('railroadNotification.personNotified')}
                />
              )}
            </FormField>
            <FormField label="Title / Role">
              {(id) => (
                <input
                  id={id}
                  type="text"
                  className="lyon-input"
                  placeholder="e.g. Road Master"
                  {...register('railroadNotification.personTitle')}
                />
              )}
            </FormField>
          </div>
        </>
      )}

      {wasNotified === false && (
        <div className={styles.warningBanner} role="alert">
          ⚠ Notification overdue — ensure the railroad client is notified per contract deadlines.
        </div>
      )}

      <FormField label="Notes">
        {(id) => (
          <textarea
            id={id}
            className="lyon-input"
            rows={2}
            placeholder="Any additional notes about the notification…"
            {...register('railroadNotification.notes')}
          />
        )}
      </FormField>
    </div>
  );
}
