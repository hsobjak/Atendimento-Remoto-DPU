import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AssessmentProvider } from './context/AssessmentContext';
import Layout from './components/Layout';
import ProfileStep from './components/Steps/ProfileStep';
import FamilyStep from './components/Steps/FamilyStep';
import FinancialStep from './components/Steps/FinancialStep';
import ResultStep from './components/Steps/ResultStep';

function App() {
  return (
    <AssessmentProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/step/1" replace />} />
            <Route path="/step/1" element={<ProfileStep />} />
            <Route path="/step/2" element={<FamilyStep />} />
            <Route path="/step/3" element={<FinancialStep />} />
            <Route path="/result" element={<ResultStep />} />
          </Routes>
        </Layout>
      </Router>
    </AssessmentProvider>
  );
}

export default App;
