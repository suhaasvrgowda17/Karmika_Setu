import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Briefcase, UserCheck, UserMinus, Search, Filter, MapPin, Clock, PieChart as PieChartIcon, Send, X, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { WorkerPresenceStatus, UserProfile } from '../../types';
import { cn } from '../../lib/utils';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '../../hooks/useFirebase';
import { useTranslation } from '../../lib/useTranslation';

const COLORS = {
  working: '#10b981', // green-500
  available: '#f59e0b', // amber-500
  offline: '#94a3b8', // slate-400
};

export default function LiveWorkforce() {
  const { userProfile, sendHireRequest, isActionLoading } = useFirebase();
  const { t } = useTranslation(userProfile);
  const [workers, setWorkers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkerPresenceStatus | 'all'>('all');
  const [skillFilter, setSkillFilter] = useState('all');
  
  // Hiring Modal State
  const [hiringWorker, setHiringWorker] = useState<UserProfile | null>(null);
  const [jobTitle, setJobTitle] = useState('General Labor');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'worker'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const workerData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[];
      setWorkers(workerData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching workers:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleHire = async () => {
    if (!hiringWorker) return;
    
    const success = await sendHireRequest(hiringWorker.uid, hiringWorker.name || 'Worker', jobTitle);
    if (success) {
      setHiringWorker(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const stats = useMemo(() => {
    const total = workers.length;
    const working = workers.filter(w => w.status === 'working').length;
    const available = workers.filter(w => (w.status === 'available' || !w.status)).length;
    const offline = workers.filter(w => w.status === 'offline').length;
    
    return { 
      total, 
      working, 
      available, 
      offline,
      chartData: [
        { name: 'Working', value: working, color: COLORS.working },
        { name: 'Available', value: available, color: COLORS.available },
        { name: 'Offline', value: offline, color: COLORS.offline },
      ]
    };
  }, [workers]);

  const uniqueSkills = useMemo(() => {
    return Array.from(new Set(workers.map(w => w.preferredLanguage === 'hi' ? 'General Worker' : 'Skilled Worker'))); // Fallback since skill might not be on profile yet
  }, [workers]);

  const filteredWorkers = useMemo(() => {
    return workers.filter(w => {
      const name = w.name || 'Anonymous';
      const location = w.address || w.location || '';
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           location.toLowerCase().includes(searchTerm.toLowerCase());
      const currentStatus = w.status || 'available';
      const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
      // For now, skill filter is simplified since it varies by profile type
      return matchesSearch && matchesStatus;
    });
  }, [workers, searchTerm, statusFilter, skillFilter]);

  const summaryCards = [
    { label: t.totalWorkers, value: stats.total, icon: Users, color: 'text-brand-ink', bg: 'bg-brand-paper' },
    { label: t.currentlyWorking, value: stats.working, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t.availableWorkers, value: stats.available, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: t.offlineWorkers, value: stats.offline, icon: UserMinus, color: 'text-slate-500', bg: 'bg-slate-100' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl uppercase tracking-tight text-brand-ink">{t.liveWorkforceStatus}</h1>
          <p className="text-brand-muted font-medium uppercase tracking-widest text-[10px]">{t.realTimeVisibility}</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-full border border-emerald-200">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{t.systemLive}</span>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn("p-6 rounded-[2rem] border border-brand-ink/5 shadow-sm relative overflow-hidden", card.bg)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-2xl", card.bg.replace('bg-', 'bg-opacity-50 bg-'))}>
                <card.icon size={20} className={card.color} />
              </div>
              <div className="text-[10px] font-black text-brand-muted opacity-50">SHRAMIK-SETU</div>
            </div>
            <div className="text-3xl font-black text-brand-ink mb-1">{card.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-brand-muted">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-3xl border border-brand-ink/5 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted transition-colors group-focus-within:text-brand-primary" size={18} />
              <input 
                type="text"
                placeholder={t.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3 bg-brand-paper rounded-2xl text-xs font-bold border-transparent focus:border-brand-primary transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex-1 md:flex-initial px-4 py-3 bg-brand-paper rounded-2xl text-[10px] font-black uppercase tracking-widest border-transparent outline-none cursor-pointer hover:bg-brand-ink/5 transition-all"
              >
                <option value="all">{t.allStatus}</option>
                <option value="working">{t.working}</option>
                <option value="available">{t.available}</option>
                <option value="offline">{t.offline}</option>
              </select>

              <select 
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="flex-1 md:flex-initial px-4 py-3 bg-brand-paper rounded-2xl text-[10px] font-black uppercase tracking-widest border-transparent outline-none cursor-pointer hover:bg-brand-ink/5 transition-all"
              >
                <option value="all">{t.allSkills}</option>
                {uniqueSkills.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Worker List Table */}
          <div className="bg-white rounded-[2.5rem] border border-brand-ink/5 shadow-sm overflow-hidden relative">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-brand-paper border-b border-brand-ink/5">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">{t.worker}</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">{t.setuId}</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">{t.lastLocation}</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">{t.status}</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-muted text-right">{t.action}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-ink/5">
                  {filteredWorkers.map((worker) => (
                    <motion.tr 
                      layout
                      key={worker.uid}
                      className="hover:bg-brand-paper/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-ink text-white flex items-center justify-center text-[10px] font-black overflow-hidden relative">
                            {worker.photoUrl ? (
                              <img src={worker.photoUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              worker.name?.charAt(0) || '?'
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-brand-ink">{worker.name || 'Anonymous User'}</span>
                            <span className="text-[8px] font-bold text-brand-muted uppercase tracking-tighter">{worker.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{worker.setuId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-brand-muted">
                          <MapPin size={12} />
                          <span className="text-[10px] font-bold">{worker.address || 'Location TBD'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                          (worker.status === 'working') ? "bg-emerald-100 text-emerald-700" :
                          (worker.status === 'available' || !worker.status) ? "bg-amber-100 text-amber-700" : 
                          "bg-slate-100 text-slate-700"
                        )}>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            worker.status === 'working' ? "bg-emerald-500 animate-pulse" :
                            (worker.status === 'available' || !worker.status) ? "bg-amber-500" : "bg-slate-400"
                          )} />
                          {worker.status || 'available'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-brand-muted">
                        <button
                          disabled={isActionLoading}
                          onClick={() => setHiringWorker(worker)}
                          className="px-4 py-2 bg-brand-ink text-white rounded-xl hover:bg-brand-primary transition-all flex items-center gap-2 ml-auto disabled:opacity-50 group-hover:scale-105"
                        >
                          <Send size={12} />
                          {t.hireNow}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredWorkers.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-sm font-bold text-brand-muted italic">No workers matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Analysis */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-8 rounded-[2.5rem] border border-brand-ink/5 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-brand-ink mb-6 flex items-center gap-2">
              <PieChartIcon size={18} className="text-brand-primary" />
              {t.distribution}
            </h3>
            
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {stats.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#111827' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    content={({ payload }) => (
                      <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {payload?.map((entry: any, index: number) => (
                          <div key={`item-${index}`} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 pt-8 border-t border-brand-ink/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-brand-muted uppercase">{t.deploymentRate}</span>
                <span className="text-lg font-black text-emerald-600">{stats.total > 0 ? Math.round((stats.working / stats.total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-brand-paper h-3 rounded-full overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.total > 0 ? (stats.working / stats.total) * 100 : 0}%` }}
                  className="h-full bg-emerald-500 rounded-full" 
                />
              </div>
            </div>
          </section>

          <section className="bg-brand-ink p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4 relative z-10">{t.quickAction}</h3>
            <p className="text-white/60 text-xs font-medium mb-6 relative z-10">{t.requestVerificationAudit}</p>
            <button className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-brand-ink transition-all relative z-10 shadow-lg shadow-brand-primary/20">
              {t.triggerLiveAudit}
            </button>
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform" />
          </section>
        </div>
      </div>

      {/* Hiring Modal */}
      <AnimatePresence>
        {hiringWorker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHiringWorker(null)}
              className="absolute inset-0 bg-brand-ink/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-brand-ink uppercase tracking-tight">{t.hireWorker}</h3>
                    <p className="text-brand-muted text-[10px] font-black uppercase tracking-widest">{t.sendHireRequest} </p>
                  </div>
                  <button onClick={() => setHiringWorker(null)} className="p-2 hover:bg-brand-paper rounded-xl transition-colors">
                    <X size={20} className="text-brand-muted" />
                  </button>
                </div>

                <div className="flex items-center gap-4 p-4 bg-brand-paper rounded-2xl mb-6">
                  <div className="w-12 h-12 rounded-full bg-brand-ink text-white flex items-center justify-center font-black">
                    {hiringWorker.photoUrl ? (
                      <img src={hiringWorker.photoUrl} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      hiringWorker.name?.charAt(0) || '?'
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-black text-brand-ink">{hiringWorker.name}</div>
                    <div className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">{hiringWorker.setuId}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 ml-2">{t.jobTitlePurpose}</label>
                    <input 
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-brand-paper rounded-2xl text-xs font-bold border-2 border-transparent focus:border-brand-primary outline-none transition-all"
                      placeholder="e.g. Masonry for Site A"
                    />
                  </div>

                  <button
                    disabled={isActionLoading}
                    onClick={handleHire}
                    className="w-full py-4 bg-brand-ink text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-primary transition-all shadow-lg shadow-brand-ink/10 flex items-center justify-center gap-2"
                  >
                    {isActionLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={14} />
                        {t.confirmHireRequest}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/50"
          >
            <CheckCircle2 size={20} />
            <span className="text-xs font-black uppercase tracking-widest">{t.hireRequestSent}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
