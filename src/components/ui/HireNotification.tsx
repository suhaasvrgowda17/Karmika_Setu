import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Bell, X, CheckSquare } from 'lucide-react';
import { HireRequest } from '../../types';
import { cn } from '../../lib/utils';

interface HireNotificationProps {
  requests: HireRequest[];
  onReview: () => void;
  onClose: () => void;
}

export default function HireNotification({ requests, onReview, onClose }: HireNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const latestRequest = requests[0];

  useEffect(() => {
    if (requests.length > 0) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        // setIsVisible(false); // Don't auto-hide if it's important
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [requests.length]);

  if (requests.length === 0) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed bottom-8 right-8 z-[100] w-full max-w-sm"
        >
          <div className="bg-brand-ink text-white p-6 rounded-[2rem] shadow-2xl border-2 border-brand-primary/30 relative overflow-hidden group">
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center animate-bounce shadow-lg shadow-brand-primary/20">
                <Briefcase className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary mb-1">New Job Offer!</div>
                <h4 className="font-black text-lg leading-tight mb-2 uppercase">{latestRequest.jobTitle}</h4>
                <p className="text-white/70 text-xs mb-4">
                  <span className="font-bold text-white">{latestRequest.contractorName}</span> wants to hire you for a project.
                </p>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      onReview();
                      setIsVisible(false);
                    }}
                    className="flex-1 bg-brand-primary text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-brand-ink transition-all"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>

            {/* Decorative background element */}
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl group-hover:bg-brand-primary/20 transition-all" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
