import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, IndianRupee, Clock, Search, Filter, Phone, User, X, Info } from 'lucide-react';
import { JobListing, WorkCategory } from '../../types';
import { useFirebaseData } from '../../contexts/FirebaseContext';
import { useTranslation } from '../../lib/useTranslation';
import { cn } from '../../lib/utils';

export default function JobBoard() {
  const { userProfile, jobListings } = useFirebaseData();
  const { t } = useTranslation(userProfile);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WorkCategory | 'all'>('all');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);

  const filteredJobs = jobListings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.contractorName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="font-display font-black text-3xl uppercase tracking-tight text-brand-ink mb-2">{t.availableWorkTitle}</h1>
        <p className="text-brand-muted">{t.availableWorkDesc}</p>
      </header>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
          <input 
            type="text"
            placeholder={t.searchJobsPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-brand-ink/5 rounded-2xl shadow-sm focus:ring-2 focus:ring-brand-primary outline-none font-bold text-xs"
          />
        </div>
      </div>

      {/* Job Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <motion.div
            layout
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-brand-ink/5 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-1 text-emerald-600 font-black">
                <IndianRupee size={14} />
                <span className="text-sm">{job.dailyWage}</span>
                <span className="text-[10px] opacity-40 uppercase">{t.perDay}</span>
              </div>
            </div>

            <h3 className="text-lg font-black text-brand-ink mb-2 group-hover:text-brand-primary transition-colors">
              {job.title}
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-brand-muted">
                <MapPin size={14} />
                <span className="text-[10px] font-bold">{job.location}</span>
              </div>
              <div className="flex items-center gap-2 text-brand-muted">
                <User size={14} />
                <span className="text-[10px] font-bold">{job.contractorName}</span>
              </div>
            </div>

            <div className="mt-auto">
              <button 
                onClick={() => setSelectedJob(job)}
                className="w-full py-4 bg-brand-paper hover:bg-brand-ink hover:text-white text-brand-ink rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Info size={14} />
                {t.viewDetails}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-brand-ink/5 shadow-sm">
          <Briefcase size={48} className="mx-auto text-brand-muted/20 mb-4" />
          <h3 className="text-xl font-black text-brand-ink uppercase">{t.noJobsFound}</h3>
          <p className="text-brand-muted text-sm mt-2 font-medium">{t.adjustFilters}</p>
        </div>
      )}

      {/* Detailed Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="absolute inset-0 bg-brand-ink/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-brand-ink uppercase tracking-tight leading-none">
                      {selectedJob.title}
                    </h2>
                  </div>
                  <button onClick={() => setSelectedJob(null)} className="p-3 hover:bg-brand-paper rounded-2xl transition-colors">
                    <X size={24} className="text-brand-muted" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-6">
                    <div className="p-6 bg-brand-paper rounded-3xl">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-4 underline decoration-brand-primary decoration-2 underline-offset-4">{t.jobRequirements}</h4>
                      <p className="text-sm font-bold text-brand-ink leading-relaxed">
                        {selectedJob.description || t.noDescriptionProvided}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                        <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest block mb-1">{t.dailyWage}</span>
                        <span className="text-xl font-black text-emerald-700">₹{selectedJob.dailyWage}</span>
                      </div>
                      <div className="flex-1 p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                        <span className="text-[8px] font-black uppercase text-blue-600 tracking-widest block mb-1">{t.postedOn}</span>
                        <span className="text-xl font-black text-blue-700">{new Date(selectedJob.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-brand-ink text-white rounded-3xl shadow-xl shadow-brand-ink/20">
                      <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-6 border-b border-white/10 pb-4">{t.contractorDetails}</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User size={12} className="text-brand-primary" />
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{t.postedBy}</span>
                          </div>
                          <div className="text-lg font-black">{selectedJob.contractorName}</div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin size={12} className="text-brand-primary" />
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{t.siteLocation}</span>
                          </div>
                          <div className="text-sm font-bold">{selectedJob.contractorLocation}</div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/10">
                          <div className="flex items-center gap-2 mb-1">
                            <Phone size={12} className="text-brand-primary" />
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{t.directContact}</span>
                          </div>
                          <a href={`tel:${selectedJob.contractorPhone}`} className="text-xl font-black hover:text-brand-primary transition-colors flex items-center gap-2">
                             {selectedJob.contractorPhone}
                          </a>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        window.open(`tel:${selectedJob.contractorPhone}`);
                      }}
                      className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-ink transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3"
                    >
                      <Phone size={18} />
                      {t.callToEnquire}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
