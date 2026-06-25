import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Search, User, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile } from '../../types';
import Analysis from './Analysis';

interface ShortlistProps {
  shortlistIds: string[];
  onRemove: (id: string) => void;
}

export default function Shortlist({ shortlistIds, onRemove }: ShortlistProps) {
  const [workers, setWorkers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchShortlistedWorkers = async () => {
      if (!shortlistIds || shortlistIds.length === 0) {
        setWorkers([]);
        return;
      }

      setIsLoading(true);
      try {
        const q = query(
          collection(db, 'users'),
          where('setuId', 'in', shortlistIds)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data() as UserProfile);
        setWorkers(data);
      } catch (error) {
        console.error('Error fetching shortlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShortlistedWorkers();
  }, [shortlistIds]);

  if (selectedWorker) {
    const mockTranslation = {
      analysis: 'Analysis',
      analysisDesc: 'Performance metrics',
      skillLevel: 'Reliability',
      totalEarnings: 'Verified Earnings',
      earningsHistory: 'Earnings History',
      workDistribution: 'Work Mix',
      strategyTip: 'Insight',
      strategyDesc: 'Based on historical verification consistency.',
      noRecordsFound: 'No detailed records for this view'
    };

    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedWorker(null)}
          className="text-xs font-black uppercase tracking-widest text-brand-muted hover:text-brand-ink transition-all mb-4"
        >
          ← Back to Shortlist
        </button>
        <div className="bg-white p-8 rounded-[2.5rem] border border-brand-ink/5">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-brand-paper rounded-[1.5rem] flex items-center justify-center text-brand-ink border border-brand-ink/5">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-brand-ink">{selectedWorker.name}</h2>
                  <p className="text-sm text-brand-muted">ID: {selectedWorker.setuId} • {selectedWorker.totalDaysWorked} Days Worked</p>
                </div>
              </div>
              <ShieldCheck className="text-brand-primary" size={32} />
           </div>
           <Analysis 
             entries={[]} 
             isPublic={true} 
             t={mockTranslation} 
             overrideProfile={selectedWorker} 
           />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="font-display text-4xl font-black mb-2 text-brand-ink uppercase tracking-tight flex items-center gap-3">
          <Star className="text-yellow-500 fill-current" size={32} />
          Talent Pool
        </h1>
        <p className="text-brand-muted">Your curated list of verified workers for quick access and tracking.</p>
      </header>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-ink"></div>
        </div>
      ) : workers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {workers.map((worker) => (
              <motion.div
                key={worker.setuId}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl border border-brand-ink/5 p-6 hover:shadow-xl hover:shadow-brand-ink/5 transition-all group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 bg-brand-paper rounded-2xl flex items-center justify-center text-brand-ink">
                    <User size={24} />
                  </div>
                  <button 
                    onClick={() => onRemove(worker.setuId)}
                    className="p-2 text-brand-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-brand-ink text-lg">{worker.name}</h3>
                    <p className="text-sm font-black text-brand-muted uppercase tracking-widest">{worker.setuId}</p>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 bg-brand-paper p-3 rounded-2xl">
                      <p className="text-[10px] font-black uppercase text-brand-muted mb-1">Days</p>
                      <p className="font-bold text-brand-ink">{worker.totalDaysWorked}</p>
                    </div>
                    <div className="flex-1 bg-brand-paper p-3 rounded-2xl">
                        <p className="text-[10px] font-black uppercase text-brand-muted mb-1">Earnings</p>
                        <p className="font-bold text-brand-ink">₹{worker.totalEarnings.toLocaleString()}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedWorker(worker)}
                    className="w-full bg-brand-ink text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-black transition-all"
                  >
                    View Details <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-brand-paper rounded-[2.5rem] p-12 text-center border-2 border-dashed border-brand-ink/10">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-brand-muted mx-auto mb-4">
            <Star size={32} />
          </div>
          <h3 className="text-xl font-bold text-brand-ink mb-2">No workers shortlisted yet</h3>
          <p className="text-brand-muted mb-8 max-w-sm mx-auto">
            Find workers in the Search section and tap the star icon to add them to your talent pool.
          </p>
        </div>
      )}
    </div>
  );
}
