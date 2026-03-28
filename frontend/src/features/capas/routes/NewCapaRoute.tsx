import { Link } from 'react-router-dom';
import { CapaForm } from '../components/CapaForm/CapaForm';
import styles from './NewCapaRoute.module.css';

export function NewCapaRoute() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/app/capas" className={styles.back}>← Back to CAPAs</Link>
        <h1 className={styles.title}>New CAPA</h1>
        <p className={styles.subtitle}>Create a Corrective or Preventive Action</p>
      </div>

      <CapaForm />
    </div>
  );
}
