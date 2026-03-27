import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button, FormField } from '../../../../components/ui';
import type { IncidentFormValues } from '../../types';
import styles from './LocationPicker.module.css';

export function LocationPicker() {
  const { register, setValue, watch, formState: { errors } } = useFormContext<IncidentFormValues>();
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError]     = useState('');

  const gpsSource = watch('location.gpsSource');
  const lat       = watch('location.latitude');
  const lng       = watch('location.longitude');

  function requestGps() {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('location.latitude', pos.coords.latitude, { shouldDirty: true });
        setValue('location.longitude', pos.coords.longitude, { shouldDirty: true });
        setValue('location.gpsSource', 'gps', { shouldDirty: true });
        setGpsLoading(false);
      },
      () => {
        setGpsError('Could not retrieve GPS coordinates. Enter location manually.');
        setValue('location.gpsSource', 'manual', { shouldDirty: true });
        setGpsLoading(false);
      },
      { timeout: 8000 },
    );
  }

  function clearGps() {
    setValue('location.latitude', null, { shouldDirty: true });
    setValue('location.longitude', null, { shouldDirty: true });
    setValue('location.gpsSource', 'manual', { shouldDirty: true });
  }

  return (
    <div className={styles.wrapper}>
      {/* GPS row */}
      <div className={styles.gpsRow}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={requestGps}
          isLoading={gpsLoading}
        >
          📍 Auto-detect GPS
        </Button>

        {gpsSource === 'gps' && lat !== null && (
          <span className={styles.gpsCoords}>
            {lat.toFixed(5)}, {lng?.toFixed(5)}
            <button type="button" className={styles.clearBtn} onClick={clearGps} aria-label="Clear GPS">
              ✕
            </button>
          </span>
        )}
        {gpsError && <span className={styles.gpsErr}>{gpsError}</span>}
      </div>

      {/* Text description — always shown */}
      <FormField
        label="Location Description"
        required
        hint="Street address, milepost, or landmark. Required even with GPS."
        error={errors.location?.textDescription?.message}
      >
        {(id) => (
          <textarea
            id={id}
            className="lyon-input"
            rows={2}
            placeholder="e.g. MP 142.3 — Indianapolis Sub, north of Bridge 88"
            {...register('location.textDescription', { required: 'Location description is required.' })}
          />
        )}
      </FormField>
    </div>
  );
}
