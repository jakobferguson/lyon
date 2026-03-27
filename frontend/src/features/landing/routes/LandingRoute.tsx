import { LandingHeader } from '../components/LandingHeader';
import { HeroSection } from '../components/HeroSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { DivisionsSection } from '../components/DivisionsSection';
import { LandingFooter } from '../components/LandingFooter';

export function LandingRoute() {
  return (
    <>
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>
      <LandingHeader />
      <main id="main-content">
        <HeroSection />
        <FeaturesSection />
        <DivisionsSection />
      </main>
      <LandingFooter />
    </>
  );
}
