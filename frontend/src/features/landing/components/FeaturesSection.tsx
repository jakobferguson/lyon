import styles from './FeaturesSection.module.css';

const FEATURES = [
  {
    icon: '📋',
    title: 'Incident Reporting',
    description:
      'Quick-capture forms for field reporters, full report staging, photo uploads, GPS auto-fill, and OSHA recordability decision trees.',
  },
  {
    icon: '🔍',
    title: '5-Why Investigation',
    description:
      'Guided root cause analysis with contributing factor classification, causal chain visualization, and investigation approval workflows.',
  },
  {
    icon: '✅',
    title: 'CAPA Management',
    description:
      'Corrective and preventive action tracking with due date enforcement, effectiveness verification, and recurrence linking.',
  },
  {
    icon: '📊',
    title: 'Safety Dashboards',
    description:
      'Real-time TRIR and DART metrics, division-level trends, incident heat maps, and executive-ready report exports.',
  },
  {
    icon: '🔒',
    title: 'Role-Based Access',
    description:
      'Seven distinct roles from Field Reporter to Admin, with scoped data visibility and medical information access controls.',
  },
  {
    icon: '🚂',
    title: 'Railroad Integration',
    description:
      'Railroad property geofencing, client notification workflows, and Class 1 railroad reporting (BNSF, UP, CSX, NS, CN, KCS).',
  },
] as const;

export function FeaturesSection() {
  return (
    <section className={styles.section} id="features" aria-labelledby="features-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Platform Capabilities</p>
          <h2 className={styles.heading} id="features-heading">
            Built for the Field.<br />Designed for Safety.
          </h2>
          <p className={styles.subheading}>
            Every workflow from incident capture to corrective action close-out in a
            single, connected platform.
          </p>
        </header>

        <div className={styles.grid} role="list">
          {FEATURES.map(({ icon, title, description }) => (
            <article key={title} className={styles.card} role="listitem">
              <span className={styles.icon} aria-hidden="true">{icon}</span>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardDesc}>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
