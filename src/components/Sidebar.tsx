import { 
  User, 
  BarChart3, 
  PlusCircle, 
  History, 
  FileDown, 
  Settings, 
  HelpCircle,
  Star,
  Globe,
  PieChart as PieIcon,
  Landmark,
  ShieldAlert,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  ShieldCheck
} from 'lucide-react';
import { Section, UserRole, HireRequest } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { useFirebaseData } from '../contexts/FirebaseContext';

interface SidebarProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  t: any;
  role?: UserRole;
}

export default function Sidebar({ activeSection, setActiveSection, isOpen, setIsOpen, onLogout, t, role }: SidebarProps) {
  const { hireRequests } = useFirebaseData();
  const pendingCount = (hireRequests || []).filter((r: HireRequest) => r.status === 'pending').length;

  const workerItems = [
    { id: 'profile' as Section, label: t.profile, icon: User },
    { id: 'analysis' as Section, label: t.analysis, icon: BarChart3 },
    { id: 'add-work' as Section, label: t.addWork, icon: PlusCircle },
    { id: 'history' as Section, label: t.history, icon: History },
    { id: 'report' as Section, label: t.report, icon: FileDown },
    { id: 'hire-workers' as Section, label: t.requests, icon: Briefcase, hasBadge: pendingCount > 0 && role === 'worker' },
    { id: 'financial' as Section, label: t.finance, icon: Landmark },
    { id: 'support' as Section, label: t.support, icon: ShieldAlert },
    { id: 'help' as Section, label: t.faq, icon: HelpCircle },
    { id: 'settings' as Section, label: t.settings, icon: Settings },
  ];

  const orgItems = [
    { id: 'org-dashboard' as Section, label: t.marketInsights, icon: BarChart3 },
    { id: 'live-workforce' as Section, label: t.liveMonitor, icon: Globe },
    { id: 'org-analysis' as Section, label: t.creditAnalytics, icon: PieIcon },
    { id: 'impact' as Section, label: t.impactEsg, icon: Globe },
    { id: 'help' as Section, label: t.howItWorks, icon: HelpCircle },
    { id: 'settings' as Section, label: t.settings, icon: Settings },
  ];

  const contractorItems = [
    { id: 'contractor-dashboard' as Section, label: t.dashboard || 'Dashboard', icon: BarChart3 },
    { id: 'live-workforce' as Section, label: t.workforceLive, icon: Globe },
    { id: 'analysis' as Section, label: t.workAnalysis, icon: PieIcon },
    { id: 'shortlist' as Section, label: t.myCrew, icon: Users },
    { id: 'help' as Section, label: t.guide, icon: HelpCircle },
    { id: 'settings' as Section, label: t.settings, icon: Settings },
  ];

  const menuItems = role === 'organization' ? orgItems : (role === 'contractor' ? contractorItems : workerItems);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isOpen ? 280 : 80 }}
      className={cn(
        "bg-white border-r border-brand-ink/10 flex flex-col h-full relative z-40 transition-all duration-300",
        !isOpen && "items-center"
      )}
    >
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3 overflow-hidden">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg",
          role === 'organization' ? "bg-brand-ink shadow-black/20" : 
          role === 'contractor' ? "bg-orange-500 shadow-orange-500/20" :
          "bg-brand-primary shadow-brand-primary/20"
        )}>
          {role === 'organization' ? <BarChart3 size={24} /> : 
           role === 'contractor' ? <Briefcase size={24} /> :
           <PlusCircle size={24} />}
        </div>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <span className="font-display font-black text-xl leading-none text-brand-ink">SHRAMIK</span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-brand-muted">SETU</span>
          </motion.div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative",
              activeSection === item.id 
                ? (role === 'organization' ? "bg-brand-ink text-white shadow-lg shadow-black/20" : 
                   role === 'contractor' ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" :
                   "bg-brand-primary text-white shadow-lg shadow-brand-primary/20")
                : "text-brand-muted hover:bg-brand-ink/5 hover:text-brand-ink"
            )}
          >
            <item.icon size={24} className="shrink-0" />
            {(item as any).hasBadge && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
            )}
            {isOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-medium whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
            
            {/* Tooltip for collapsed state */}
            {!isOpen && (
              <div className="absolute left-16 bg-[#141414] text-white px-2 py-1 rounded text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-brand-ink/10">
        <button
          onClick={onLogout}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors group relative",
            !isOpen && "justify-center"
          )}
        >
          <LogOut size={24} className="shrink-0" />
          {isOpen && <span className="font-medium">{t.logout}</span>}
        </button>
        
        {/* Toggle Collapse */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="hidden lg:flex w-full items-center justify-center p-2 mt-4 text-brand-muted hover:text-brand-ink transition-colors"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </motion.aside>
  );
}
