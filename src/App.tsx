import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import LandingPage from './components/Landing/LandingPage';
import Step1BasicInfo from './components/InputForm/Step1BasicInfo';
import Step2Goals from './components/InputForm/Step2Goals';
import Step3Strategy from './components/InputForm/Step3Strategy';
import Step4Payout from './components/InputForm/Step4Payout';
import Dashboard from './components/Results/Dashboard';
import PrivacyPolicy from './components/Legal/PrivacyPolicy';
import TermsOfService from './components/Legal/TermsOfService';
import Contact from './components/Legal/Contact';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function GA4RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname,
        page_title: document.title,
      });
    }
  }, [location.pathname]);

  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <GA4RouteTracker />
      <ScrollToTop />
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/step1" element={<Step1BasicInfo />} />
            <Route path="/step2" element={<Step2Goals />} />
            <Route path="/step3" element={<Step3Strategy />} />
            <Route path="/step4" element={<Step4Payout />} />
            <Route path="/result" element={<Dashboard />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
