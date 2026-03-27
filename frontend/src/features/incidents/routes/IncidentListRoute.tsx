import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui';
import { IncidentTable } from '../components/IncidentTable/IncidentTable';
import styles from './IncidentListRoute.module.css';

export function IncidentListRoute() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Incidents</h1>
        <Button variant="accent" onClick={() => navigate('/app/incidents/new')}>
          + New Incident
        </Button>
      </div>
      <IncidentTable />
    </div>
  );
}
