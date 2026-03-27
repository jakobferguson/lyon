import styles from './DivisionsSection.module.css';

const DIVISIONS = [
  { code: 'HCC', name: 'Herzog Contracting Corp.' },
  { code: 'HRSI', name: 'Herzog Railway Services, Inc.' },
  { code: 'HSI', name: 'Herzog Services, Inc.' },
  { code: 'HTI', name: 'Herzog Transit Inc.' },
  { code: 'HTSI', name: 'Herzog Technology Solutions, Inc.' },
  { code: 'HE', name: 'Herzog Energy' },
  { code: 'GG', name: 'Green Group' },
] as const;

export function DivisionsSection() {
  return (
    <section className={styles.section} id="divisions" aria-labelledby="divisions-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Serving All Divisions</p>
          <h2 className={styles.heading} id="divisions-heading">One Platform. Seven Divisions.</h2>
        </header>

        <ol className={styles.list} aria-label="Herzog divisions">
          {DIVISIONS.map(({ code, name }) => (
            <li key={code} className={styles.item}>
              <span className={styles.code}>{code}</span>
              <span className={styles.name}>{name}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
