import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Briefcase, Plus, ShieldCheck, MapPin, Clock, XCircle, CheckCircle2, UserCheck, TrendingUp, IndianRupee, Copy, ArrowUpRight } from 'lucide-react';
import { ContractorProfile, JobListing, WorkCategory } from '../../types';
import { useTranslation } from '../../lib/useTranslation';
import { cn } from '../../lib/utils';
import { useFirebaseData } from '../../contexts/FirebaseContext';
import { useFirebase } from '../../hooks/useFirebase';

interface ContractorDashboardProps {
  profile: ContractorProfile;
  onVerify: (id: string) => void;
}

export default function ContractorDashboard({ profile, onVerify }: ContractorDashboardProps) {
  const { verificationRequests, jobListings } = useFirebaseData();
  const { respondToVerification, postJobListing } = useFirebase();
  const { t } = useTranslation(profile as any);
  const [showAddJob, setShowAddJob] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);

  const [jobForm, setJobForm] = React.useState<Partial<JobListing>>({
    title: '',
    category: WorkCategory.CONSTRUCTION,
    dailyWage: 800,
    location: profile.address || 'Active Site',
    description: ''
  });

  const myJobs = React.useMemo(() => {
    return jobListings.filter(j => j.contractorId === profile.uid);
  }, [jobListings, profile.uid]);

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await postJobListing(jobForm as any);
    if (success) {
      setShowAddJob(false);
      setJobForm({
        title: '',
        category: WorkCategory.CONSTRUCTION,
        dailyWage: 800,
        location: profile.address || 'Active Site',
        description: ''
      });
    }
  };

  const handleApprove = async (id: string) => {
    setIsProcessing(id);
    try {
      await respondToVerification(id, 'verified');
      // Toast or success message could go here
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    setIsProcessing(id);
    try {
      await respondToVerification(id, 'rejected');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display font-black text-3xl uppercase tracking-tight text-brand-ink">
              {profile.companyName || profile.name}
            </h1>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(profile.pradhanId);
                alert("Pradhan ID Copied!");
              }}
              className="group flex items-center gap-2 px-3 py-1 bg-orange-500 text-white text-[10px] font-black rounded-full tracking-widest uppercase shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            >
              {profile.pradhanId}
              <Copy size={12} className="opacity-60 group-hover:opacity-100" />
            </button>
          </div>
          <p className="text-brand-muted">{t.contractorCommandCenter}</p>
        </div>
        <button 
          onClick={() => setShowAddJob(true)}
          className="bg-brand-ink text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all text-sm uppercase tracking-widest"
        >
          <Plus size={18} /> {t.postWork}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-brand-ink/5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            <UserCheck size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-brand-ink">42</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">{t.verifiedWorkers}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-brand-ink/5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Briefcase size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-brand-ink">{myJobs.length}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">{t.activeListings}</div>
          </div>
        </div>
        <button 
          onClick={() => onVerify('DISCOVER')} 
          className="bg-white p-6 rounded-[2rem] border border-brand-ink/5 flex items-center justify-between shadow-sm hover:border-orange-500 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-2xl font-black text-brand-ink leading-none">{t.findCrew}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">{t.discoverTalent}</div>
            </div>
          </div>
          <ArrowUpRight className="text-brand-muted group-hover:text-orange-500 transition-all" size={20} />
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Verification Queue */}
        <section className="bg-white rounded-[2.5rem] p-8 border border-brand-ink/5">
          <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3 text-brand-ink">
            <ShieldCheck className="text-orange-500" />
            {t.vouchForWork}
          </h2>
          <div className="space-y-4">
            {verificationRequests.map(claim => (
              <div key={claim.id} className="bg-brand-paper p-5 rounded-2xl border border-brand-ink/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-xs">
                    {claim.workerName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-ink text-sm">{claim.workerName}</h4>
                    <p className="text-[10px] font-black uppercase opacity-40">{claim.workType} • {claim.hours}hrs • {claim.date}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    disabled={isProcessing === claim.id}
                    onClick={() => handleApprove(claim.id)}
                    className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <CheckCircle2 size={18} />
                  </button>
                  <button 
                    disabled={isProcessing === claim.id}
                    onClick={() => handleReject(claim.id)}
                    className="p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </div>
            ))}
            {verificationRequests.length === 0 && (
              <div className="text-center py-12 text-brand-muted italic bg-brand-paper rounded-2xl">
                {t.allClaimsReviewed}
              </div>
            )}
          </div>
        </section>

        {/* Jobs section */}
        <section className="bg-white rounded-[2.5rem] p-8 border border-brand-ink/5">
          <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3 text-brand-ink">
            <Briefcase className="text-blue-500" />
            {t.livePostings}
          </h2>
          <div className="space-y-4">
            {myJobs.map(job => (
              <div key={job.id} className="p-5 bg-brand-paper rounded-2xl border border-brand-ink/5 group hover:border-brand-ink/10 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-black uppercase bg-white px-2 py-1 rounded text-brand-muted">
                    {job.category}
                  </span>
                  <span className="text-xs font-black text-brand-ink">₹{job.dailyWage}</span>
                </div>
                <h4 className="font-bold text-brand-ink mb-1">{job.title}</h4>
                <div className="flex items-center gap-3 text-[10px] font-bold text-brand-muted">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                </div>
              </div>
            ))}
            {myJobs.length === 0 && (
              <div className="text-center py-12 text-brand-muted italic bg-brand-paper rounded-2xl">
                {t.noActiveJobPosts}
              </div>
            )}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showAddJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-ink/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center text-brand-ink">
                <h3 className="text-2xl font-black uppercase tracking-tight">{t.postNewWork}</h3>
                <button onClick={() => setShowAddJob(false)} className="p-2 hover:bg-brand-paper rounded-full transition-colors">
                  <XCircle size={24} className="text-brand-muted" />
                </button>
              </div>

              <form onSubmit={handleAddJob} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">{t.jobTitle}</label>
                  <input 
                    required
                    type="text" 
                    value={jobForm.title}
                    onChange={e => setJobForm({...jobForm, title: e.target.value})}
                    placeholder="e.g. Mason for Metro Project"
                    className="w-full bg-brand-paper border-none rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 font-bold"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">{t.dailyWage} (₹)</label>
                    <input 
                      required
                      type="number" 
                      value={jobForm.dailyWage}
                      onChange={e => setJobForm({...jobForm, dailyWage: parseInt(e.target.value)})}
                      className="w-full bg-brand-paper border-none rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">{t.location}</label>
                    <input 
                      required
                      type="text" 
                      value={jobForm.location}
                      onChange={e => setJobForm({...jobForm, location: e.target.value})}
                      className="w-full bg-brand-paper border-none rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">{t.description}</label>
                  <textarea 
                    value={jobForm.description}
                    onChange={e => setJobForm({...jobForm, description: e.target.value})}
                    rows={3}
                    className="w-full bg-brand-paper border-none rounded-2xl p-4 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
                >
                  {t.confirmPosting}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
