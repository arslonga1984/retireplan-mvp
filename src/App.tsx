import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Layout/Header';
import Step1BasicInfo from './components/InputForm/Step1BasicInfo';
import Step2Goals from './components/InputForm/Step2Goals';
import Step3Strategy from './components/InputForm/Step3Strategy';
import Step4Payout from './components/InputForm/Step4Payout';
import Dashboard from './components/Results/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
          <Routes>
            <Route path="/" element={<Navigate to="/step1" replace />} />
            <Route path="/step1" element={<Step1BasicInfo />} />
            <Route path="/step2" element={<Step2Goals />} />
            <Route path="/step3" element={<Step3Strategy />} />
            <Route path="/step4" element={<Step4Payout />} />
            <Route path="/result" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
