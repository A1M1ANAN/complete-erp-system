import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import LoadingScreen from './components/Common/LoadingScreen';

// Page Components
import Dashboard from './pages/Dashboard';
import SalesManagement from './pages/SalesManagement';
import PurchaseManagement from './pages/PurchaseManagement';
import InventoryManagement from './pages/InventoryManagement';
import CustomerManagement from './pages/CustomerManagement';
import SupplierManagement from './pages/SupplierManagement';
import AccountingSystem from './pages/AccountingSystem';
import ReportsSystem from './pages/ReportsSystem';
import UserManagement from './pages/UserManagement';
import CompanyManagement from './pages/CompanyManagement';
import TaxManagement from './pages/TaxManagement';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CompanyProvider } from './contexts/CompanyContext';

// Hooks
import { useLocalStorage } from './hooks/useLocalStorage';

const AppContent = () => {
  const { i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [language] = useLocalStorage('language', 'ar');

  useEffect(() => {
    // Set language and direction
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [language, i18n]);

  if (loading || authLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen} 
      />
      
      <main className={`transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
      } ${i18n.language === 'ar' && sidebarOpen ? 'lg:mr-64 lg:ml-0' : ''}`}>
        <div className="pt-16 px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sales/*" element={<SalesManagement />} />
            <Route path="/purchases/*" element={<PurchaseManagement />} />
            <Route path="/inventory/*" element={<InventoryManagement />} />
            <Route path="/customers/*" element={<CustomerManagement />} />
            <Route path="/suppliers/*" element={<SupplierManagement />} />
            <Route path="/accounting/*" element={<AccountingSystem />} />
            <Route path="/reports/*" element={<ReportsSystem />} />
            <Route path="/users/*" element={<UserManagement />} />
            <Route path="/companies/*" element={<CompanyManagement />} />
            <Route path="/taxes/*" element={<TaxManagement />} />
            <Route path="/settings/*" element={<Settings />} />
          </Routes>
        </div>
      </main>

      <Toaster
        position={i18n.language === 'ar' ? 'top-left' : 'top-right'}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontFamily: i18n.language === 'ar' ? 'Cairo' : 'Inter',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CompanyProvider>
          <Router>
            <AppContent />
          </Router>
        </CompanyProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
