import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import RoleSelection from './components/RoleSelection';
import CompleteProfile from './components/CompleteProfile';
import CompleteOrgProfile from './components/CompleteOrgProfile';
import Profile from './components/sections/Profile';
import Analysis from './components/sections/Analysis';
import AddWorkEntry from './components/sections/AddWorkEntry';
import WorkHistory from './components/sections/WorkHistory';
import DownloadReport from './components/sections/DownloadReport';
import Settings from './components/sections/Settings';
import OrgDashboard from './components/sections/OrgDashboard';
import OrgAnalysis from './components/sections/OrgAnalysis';
import WorkerSearch from './components/sections/WorkerSearch';
import Shortlist from './components/sections/Shortlist';
import ImpactReport from './components/sections/ImpactReport';
import HowItWorks from './components/sections/HowItWorks';
import FinancialHub from './components/sections/FinancialHub';
import Support from './components/sections/Support';
import HireRequests from './components/sections/HireRequests';
import HireNotification from './components/ui/HireNotification';
import LiveWorkforce from './components/sections/LiveWorkforce';
import PublicProfile from './components/PublicProfile';
import ContractorDashboard from './components/sections/ContractorDashboard';
import ContractorAnalysis from './components/sections/ContractorAnalysis';
import JobBoard from './components/sections/JobBoard';
import LabourCard from './components/ui/LabourCard';
import { Section, UserRole, OrganizationProfile, ContractorProfile } from './types';
import { Menu, X } from 'lucide-react';
import { auth } from './lib/firebase';
import { useFirebase } from './hooks/useFirebase';
import { useTranslation } from './lib/useTranslation';

export default function App() {
  const { userProfile, workEntries, hireRequests, loading, addWorkEntry, updateProfile, toggleShortlist } = useFirebase();
  const [tempLang, setTempLang] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('karmik_temp_lang') || 'hi';
    }
    return 'hi';
  });

  const { t, lang } = useTranslation((userProfile?.preferredLanguage ? userProfile : { preferredLanguage: tempLang }) as any);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('selectedRole') as UserRole) || null;
    }
    return null;
  });
  const [workerSearchQuery, setWorkerSearchQuery] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  // Handle Public Profile View
  const [publicViewId, setPublicViewId] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/view/')) {
      const id = path.split('/view/')[1];
      if (id) setPublicViewId(id);
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const isDemoMode = localStorage.getItem('karmik_demo_mode') === 'true';
      setIsLoggedIn(!!user || isDemoMode);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      localStorage.setItem('selectedRole', selectedRole);
    }
  }, [selectedRole]);

  useEffect(() => {
    if (userProfile?.role === 'organization' && activeSection === 'profile') {
      setActiveSection('org-dashboard');
    } else if (userProfile?.role === 'contractor' && activeSection === 'profile') {
      setActiveSection('contractor-dashboard');
    }
  }, [userProfile]);

  const handleSectionChange = (section: Section) => {
    if (section !== 'worker-search') {
      setWorkerSearchQuery('');
    }
    setActiveSection(section);
  };

  if (publicViewId) {
    return <PublicProfile setuId={publicViewId} />;
  }

  const renderSection = () => {
    if (userProfile?.role === 'organization') {
      const org = userProfile as OrganizationProfile;
      switch (activeSection) {
        case 'org-dashboard': return <OrgDashboard profile={org} />;
        case 'live-workforce': return <LiveWorkforce />;
        case 'org-analysis': return <OrgAnalysis />;
        case 'impact': return <ImpactReport />;
        case 'help': return <HowItWorks role={userProfile.role as any} />;
        case 'settings': return <Settings profile={userProfile as any} t={t} theme={theme} onThemeToggle={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />;
        default: return <OrgDashboard profile={org} />;
      }
    }

    if (userProfile?.role === 'contractor') {
      const con = userProfile as ContractorProfile;
      switch (activeSection) {
        case 'contractor-dashboard': return (
          <ContractorDashboard 
            profile={con} 
            onVerify={(id) => {
              setActiveSection('live-workforce');
            }} 
          />
        );
        case 'analysis': return <ContractorAnalysis />;
        case 'live-workforce': return <LiveWorkforce />;
        case 'worker-search': return <WorkerSearch initialQuery={workerSearchQuery} />;
        case 'hire-workers': return <HireRequests />;
        case 'help': return <HowItWorks role={userProfile.role as any} />;
        case 'settings': return <Settings profile={userProfile as any} t={t} theme={theme} onThemeToggle={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />;
        default: return <ContractorDashboard profile={con} onVerify={(id) => {
          setWorkerSearchQuery(id);
          setActiveSection('worker-search');
        }} />;
      }
    }

    switch (activeSection) {
      case 'profile': return <Profile profile={userProfile as any} t={t} onUpdate={updateProfile as any} onNavigate={setActiveSection} />;
      case 'analysis': return <Analysis entries={workEntries} t={t} />;
      case 'add-work': return <AddWorkEntry onAdd={addWorkEntry} t={t} lang={lang} />;
      case 'job-board': return <JobBoard />;
      case 'history': return <WorkHistory entries={workEntries} t={t} />;
      case 'report': return <DownloadReport profile={userProfile as any} entries={workEntries} t={t} />;
      case 'labour-card': return <LabourCard profile={userProfile as any} workEntries={workEntries} t={t} />;
      case 'hire-workers': return <HireRequests />;
      case 'financial': return <FinancialHub profile={userProfile} entries={workEntries} />;
      case 'support': return <Support />;
      case 'help': return <HowItWorks role="worker" />;
      case 'settings': return (
        <Settings 
          profile={userProfile as any} 
          t={t} 
          theme={theme} 
          onThemeToggle={() => setTheme(t => t === 'light' ? 'dark' : 'light')} 
          onLanguageChange={(l: string) => {
            setTempLang(l);
            localStorage.setItem('karmik_temp_lang', l);
          }}
        />
      );
      default: return <Profile profile={userProfile as any} t={t} onUpdate={updateProfile as any} />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-brand-paper flex items-center justify-center font-bold text-brand-primary animate-pulse uppercase tracking-widest">
        {t.loadingText}
      </div>
    );
  }

  if (!isLoggedIn) {
    if (!selectedRole) {
      return (
        <RoleSelection 
          onSelect={(role) => setSelectedRole(role)} 
          t={t} 
          lang={lang} 
          onLanguageChange={(l) => {
            setTempLang(l);
            localStorage.setItem('karmik_temp_lang', l);
          }}
        />
      );
    }
    return (
      <Auth 
        onLogin={() => setIsLoggedIn(true)} 
        role={selectedRole} 
        onBack={() => setSelectedRole(null)} 
        t={t}
        lang={lang}
        onLanguageChange={(l) => {
          setTempLang(l);
          localStorage.setItem('karmik_temp_lang', l);
        }}
      />
    );
  }

  if (!userProfile) {
    if (selectedRole === 'organization') {
      return <CompleteOrgProfile />;
    }
    return <CompleteProfile />;
  }

  return (
    <div className="flex h-screen bg-brand-paper overflow-hidden font-sans text-brand-ink">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-full shadow-md border border-brand-ink/10"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={handleSectionChange}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={() => {
          localStorage.removeItem('selectedRole');
          localStorage.removeItem('karmik_demo_mode');
          auth.signOut().then(() => {
            setIsLoggedIn(false);
          });
        }}
        role={userProfile?.role}
        t={t}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {userProfile?.role === 'worker' && (
        <HireNotification 
          requests={hireRequests.filter(r => r.status === 'pending')} 
          onReview={() => setActiveSection('hire-workers')}
          onClose={() => {}}
        />
      )}
    </div>
  );
}
