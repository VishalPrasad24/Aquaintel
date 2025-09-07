
import React, { useState, useEffect } from 'react';
import { AppContextProvider, useAppContext } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import DiseaseMap from './components/map/DiseaseMap';
import StudyModules from './components/study/StudyModules';
import Chatbot from './components/chatbot/Chatbot';
import Profile from './components/profile/Profile';
import Auth from './components/auth/Auth';
import RoleSelection from './components/auth/RoleSelection';
import HospitalLogin from './components/auth/HospitalLogin';

export type Page = 'dashboard' | 'map' | 'study' | 'chatbot' | 'profile';
export type UserRole = 'user' | 'hospital' | null;

const FullScreenLoader: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <svg className="mx-auto h-12 w-12 text-primary-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">{text}</p>
    </div>
  </div>
);

const AppRouter: React.FC = () => {
    const { currentPage } = useAppContext();
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'map': return <DiseaseMap />;
      case 'study': return <StudyModules />;
      case 'chatbot': return <Chatbot />;
      case 'profile': return <Profile />;
      default: return <Dashboard />;
    }
}

const AppContent: React.FC = () => {
  const { loadingProfile, isOnline, t } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loadingProfile) {
    return <FullScreenLoader text="Loading profile..." />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isOnline && (
          <div className="bg-warning-500 text-white text-center py-1 text-sm font-semibold">
            {t('offline_banner')}
          </div>
        )}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
          <AppRouter />
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(
          (registration) => console.log('Service Worker registered with scope:', registration.scope),
          (err) => console.error('Service Worker registration failed:', err)
        );
      });
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <FullScreenLoader text="Initializing Arogya Sahayak..." />;
  }

  return (
    <AppContextProvider>
      <AuthRouter />
    </AppContextProvider>
  );
};

const AuthRouter: React.FC = () => {
    const { userRole, setUserRole, profile } = useAppContext();

    if (!userRole) {
        return <RoleSelection onSelectRole={setUserRole} />;
    }
    
    if (!profile) {
        if (userRole === 'user') return <Auth />;
        if (userRole === 'hospital') return <HospitalLogin />;
    }
    
    return <AppContent />;
}

export default App;
