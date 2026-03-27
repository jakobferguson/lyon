import styles from './HeroSection.module.css';

const STATS = [
  { value: '7', label: 'Divisions' },
  { value: '5K+', label: 'Users' },
  { value: '3', label: 'Countries' },
  { value: '100%', label: 'Railroads Covered' },
] as const;

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>Herzog · SRD-10</p>
          <h1 className={styles.heading} id="hero-heading">
            Incident Investigation<br />
            <span className={styles.headingAccent}>&amp; Corrective Action</span>
          </h1>
          <p className={styles.subheading}>
            Lyon centralizes railroad incident reporting, 5-Why investigation workflows,
            CAPA management, and safety performance dashboards — purpose-built for
            Herzog's seven divisions.
          </p>

          <div className={styles.actions}>
            <a href="#sign-in" className={styles.btnPrimary} id="sign-in">
              Sign In to Lyon
            </a>
            <a href="#features" className={styles.btnSecondary}>
              Learn More
            </a>
          </div>
        </div>

        <div className={styles.statsPanel} aria-label="Platform statistics">
          {STATS.map(({ value, label }) => (
            <div key={label} className={styles.statCard}>
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.goldBar} aria-hidden="true" />
    </section>
  );
}
