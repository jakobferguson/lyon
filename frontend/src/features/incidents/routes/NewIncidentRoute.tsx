import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { IncidentForm } from '../components/IncidentForm/IncidentForm';
import type { IncidentFormValues } from '../types';
import styles from './NewIncidentRoute.module.css';

const DEFAULT_VALUES: IncidentFormValues = {
  incidentType: '',
  dateTime: '',
  location: { latitude: null, longitude: null, textDescription: '', gpsSource: 'manual' },
  description: '',
  division: '',
  project: '',
  immediateActions: '',
  severity: '',
  potentialSeverity: '',
  shift: '',
  shiftStart: '',
  shiftEnd: '',
  weather: '',
  onRailroadProperty: false,
  railroadClient: '',
  railroadNotification: {
    wasNotified: null,
    notificationDateTime: '',
    method: '',
    personNotified: '',
    personTitle: '',
    notes: '',
  },
  injuredPersons: [{
    name: '', jobTitle: '', division: '', injuryType: '', bodyPart: '',
    bodySide: '', treatmentType: '', returnToWork: '', daysAway: '', daysRestricted: '',
  }],
  isOshaRecordable: null,
  isDart: null,
  oshaOverrideJustification: '',
  status: 'Draft',
};

export function NewIncidentRoute() {
  const navigate = useNavigate();
  const methods = useForm<IncidentFormValues>({ defaultValues: DEFAULT_VALUES });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate('/app/incidents')}
          >
            ← Back to Incidents
          </button>
          <h1 className={styles.title}>New Incident Report</h1>
        </div>
      </div>

      <FormProvider {...methods}>
        <IncidentForm />
      </FormProvider>
    </div>
  );
}
