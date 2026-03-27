import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui';
import { CapaKpiCards } from '../components/CapaKpiCards/CapaKpiCards';
import { CapaTable } from '../components/CapaTable/CapaTable';
import { CapaAgingChart } from '../components/CapaAgingChart/CapaAgingChart';
import styles from './CapaListRoute.module.css';

export function CapaListRoute() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>CAPA Management</h1>
          <p className={styles.subtitle}>Corrective and Preventive Actions</p>
        </div>
        <Link to="/app/capas/new">
          <Button variant="accent">+ New CAPA</Button>
        </Link>
      </div>

      <CapaKpiCards />

      <div className={styles.grid}>
        <div className={styles.tableSection}>
          <CapaTable />
        </div>
        <div className={styles.chartSection}>
          <CapaAgingChart />
        </div>
      </div>
    </div>
  );
}
