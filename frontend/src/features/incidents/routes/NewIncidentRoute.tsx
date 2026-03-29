import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { IncidentForm } from '../components/IncidentForm/IncidentForm';
import { useCreateIncident } from '../api/incidents';
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
  photos: [],
};

export function NewIncidentRoute() {
  const navigate = useNavigate();
  const methods = useForm<IncidentFormValues>({ defaultValues: DEFAULT_VALUES });
  const createIncident = useCreateIncident();

  function handleSubmit(data: IncidentFormValues, submitAsReported: boolean) {
    createIncident.mutate(
      { form: data, submitAsReported },
      {
        onSuccess: (created) => {
          navigate(`/app/incidents/${created.id}`);
        },
      },
    );
  }

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
        <IncidentForm
          onSubmit={handleSubmit}
          isSubmitting={createIncident.isPending}
          submitError={createIncident.isError ? 'Failed to create incident. Please try again.' : null}
        />
      </FormProvider>
    </div>
  );
}
