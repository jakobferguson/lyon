import { Link, useNavigate } from 'react-router-dom';
import { CapaForm } from '../components/CapaForm/CapaForm';
import { useCreateCapa } from '../api/capas';
import type { CapaFormValues } from '../types';
import styles from './NewCapaRoute.module.css';

export function NewCapaRoute() {
  const navigate = useNavigate();
  const createCapa = useCreateCapa();

  function handleSubmit(values: CapaFormValues) {
    createCapa.mutate(
      {
        type: values.type,
        category: values.category,
        description: values.description,
        assignedToId: values.assignedTo, // CapaForm uses 'assignedTo' for the name/id field
        priority: values.priority,
        verificationMethod: values.verificationMethod || undefined,
        dueDate: values.dueDate || undefined,
        linkedIncidentIds: values.linkedIncidentIds,
      },
      {
        onSuccess: (created) => {
          navigate(`/app/capas/${created.id}`);
        },
      },
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/app/capas" className={styles.back}>← Back to CAPAs</Link>
        <h1 className={styles.title}>New CAPA</h1>
        <p className={styles.subtitle}>Create a Corrective or Preventive Action</p>
      </div>

      <CapaForm
        onSubmit={handleSubmit}
        isSubmitting={createCapa.isPending}
        submitError={createCapa.isError ? (createCapa.error as Error).message : null}
      />
    </div>
  );
}
