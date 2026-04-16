import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AssessmentProvider } from './context/AssessmentContext';
import Layout from './components/Layout';
import ResultStep from './components/Steps/ResultStep';

// Novas importações do Wizard
import WelcomeScreen from './components/Wizard/WelcomeScreen';
import PersonalQuestions from './components/Wizard/PersonalQuestions';
import AddressQuestions from './components/Wizard/AddressQuestions';
import PriorityQuestions from './components/Wizard/PriorityQuestions';
import FamilyQuestions from './components/Wizard/FamilyQuestions';
import IncomeQuestions from './components/Wizard/IncomeQuestions';
import ExpensesQuestions from './components/Wizard/ExpensesQuestions';
import AssetsQuestions from './components/Wizard/AssetsQuestions';
import DemandQuestions from './components/Wizard/DemandQuestions';

// Importações do Admin
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminReportView from './pages/Admin/AdminReportView';
import AdminTrashView from './pages/Admin/AdminTrashView';

function App() {
  return (
    <AssessmentProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            
            {/* Fluxo do Assistido */}
            <Route path="/wizard/personal" element={<PersonalQuestions />} />
            <Route path="/wizard/address" element={<AddressQuestions />} />
            <Route path="/wizard/priorities" element={<PriorityQuestions />} />
            <Route path="/wizard/family" element={<FamilyQuestions />} />
            <Route path="/wizard/income" element={<IncomeQuestions />} />
            <Route path="/wizard/expenses" element={<ExpensesQuestions />} />
            <Route path="/wizard/assets" element={<AssetsQuestions />} />
            <Route path="/wizard/demand" element={<DemandQuestions />} />
            
            <Route path="/result" element={<ResultStep />} />

            {/* Fluxo Administrativo */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/report/:id" element={<AdminReportView />} />
            <Route path="/admin/trash" element={<AdminTrashView />} />

            {/* Rotas legadas que o React Router avisará mas que podemos redirecionar para garantir (opcional) */}
            <Route path="/step/*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AssessmentProvider>
  );
}

export default App;
