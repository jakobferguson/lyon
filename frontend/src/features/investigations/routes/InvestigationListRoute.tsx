import { InvestigationTable } from '../components/InvestigationTable/InvestigationTable';
import styles from './InvestigationListRoute.module.css';

export function InvestigationListRoute() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Investigations</h1>
      </div>
      <InvestigationTable />
    </div>
  );
}
