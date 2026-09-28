import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import ProviderPortal from './components/ProviderPortal';
import PayerPortal from './components/PayerPortal';
import PatientPortal from './components/PatientPortal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import SubmissionWizard from './components/SubmissionWizard';

export default function App() {
  // Theme State ('dark' | 'light')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('priorAuth_theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('priorAuth_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('priorAuth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('priorAuth_token') || null;
  });

  const [activeTab, setActiveTab] = useState('provider'); // 'provider' | 'payer' | 'patient' | 'analytics'
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Application Data States
  const [requests, setRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [payers, setPayers] = useState([]);
  const [icd10Codes, setIcd10Codes] = useState([]);
  const [cptCodes, setCptCodes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial data from backend API
  const fetchData = async () => {
    try {
      const [reqRes, patRes, payRes, codeRes, anaRes] = await Promise.all([
        fetch('http://localhost:5000/api/prior-auth'),
        fetch('http://localhost:5000/api/patients'),
        fetch('http://localhost:5000/api/payers'),
        fetch('http://localhost:5000/api/codes/search?q='),
        fetch('http://localhost:5000/api/analytics')
      ]);

      const reqData = await reqRes.json();
      const patData = await patRes.json();
      const payData = await payRes.json();
      const codeData = await codeRes.json();
      const anaData = await anaRes.json();

      let formattedPatients = Array.isArray(patData) ? [...patData] : [];
      
      // Auto-ensure currentUser is present at the top of the patient list
      if (currentUser && currentUser.name) {
        const userExists = formattedPatients.some(
          p => p.name.toLowerCase() === currentUser.name.toLowerCase() ||
               (p.email && currentUser.email && p.email.toLowerCase() === currentUser.email.toLowerCase())
        );
        if (!userExists) {
          const userPatient = {
            id: `PAT-USER-${currentUser.id || '001'}`,
            name: currentUser.name,
            email: currentUser.email,
            age: 42,
            gender: "Not Specified",
            dob: "1984-05-15",
            insuranceProvider: "BlueCross BlueShield",
            policyNumber: `BCBS-99${Math.floor(100000 + Math.random() * 900000)}`,
            groupNumber: "GRP-8821",
            primaryDiagnosis: "M17.11 - Primary osteoarthritis, right knee",
            bmi: 26.5
          };
          formattedPatients.unshift(userPatient);
        }
      }

      setRequests(reqData);
      setPatients(formattedPatients);
      setPayers(payData);
      setIcd10Codes(codeData.icd10);
      setCptCodes(codeData.cpt);
      setAnalytics(anaData);
    } catch (err) {
      console.error("Failed to connect to backend server:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = (newPatient) => {
    setPatients(prev => [newPatient, ...prev]);
  };

  const handleUpdatePatient = (updatedPatient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setAuthToken(token);
    try {
      localStorage.setItem('priorAuth_user', JSON.stringify(user));
      localStorage.setItem('priorAuth_token', token);
    } catch (e) {
      console.warn("Unable to save user session to localStorage:", e);
    }

    // Set active tab according to user role
    if (user.role === 'payer') {
      setActiveTab('payer');
    } else if (user.role === 'patient') {
      setActiveTab('patient');
    } else {
      setActiveTab('provider');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    try {
      localStorage.removeItem('priorAuth_user');
      localStorage.removeItem('priorAuth_token');
    } catch (e) {
      console.warn("Unable to clear user session from localStorage:", e);
    }
  };

  const handleNewRequestSuccess = (newReq) => {
    setRequests([newReq, ...requests]);
    fetchData(); // Refresh analytics counters
  };

  const handleUpdateDecision = (updatedReq) => {
    setRequests(requests.map(r => r.id === updatedReq.id ? updatedReq : r));
    fetchData(); // Refresh analytics
  };

  // If not authenticated, render LoginPage with theme controls
  if (!currentUser || !authToken) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 animate-spin flex items-center justify-center mb-4 shadow-lg shadow-teal-500/20">
          <div className="w-8 h-8 rounded-xl bg-slate-900"></div>
        </div>
        <h2 className="text-lg font-bold text-white">Initializing PriorAuth AI Platform...</h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">Connecting to REST API & Python AI Engine</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-teal-100 selection:text-teal-900 transition-colors duration-300">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewWizard={() => setIsWizardOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        {activeTab === 'provider' && (
          <ProviderPortal
            requests={requests}
            onOpenNewWizard={() => setIsWizardOpen(true)}
          />
        )}

        {activeTab === 'payer' && (
          <PayerPortal
            requests={requests}
            onUpdateDecision={handleUpdateDecision}
          />
        )}

        {activeTab === 'patient' && (
          <PatientPortal
            requests={requests}
            patients={patients}
            currentUser={currentUser}
            onAddPatient={handleAddPatient}
            onUpdatePatient={handleUpdatePatient}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            analytics={analytics}
          />
        )}
      </main>

      {/* Submission Wizard Modal */}
      <SubmissionWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        patients={patients}
        payers={payers}
        icd10Codes={icd10Codes}
        cptCodes={cptCodes}
        currentUser={currentUser}
        onAddPatient={handleAddPatient}
        onSubmitSuccess={handleNewRequestSuccess}
      />

      {/* App Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            PriorAuth AI Automation Platform • HIPAA Compliant Engine
          </div>
          <div>
            Logged in as <span className="font-semibold text-slate-700">{currentUser.name}</span> ({currentUser.email})
          </div>
        </div>
      </footer>

    </div>
  );
}
