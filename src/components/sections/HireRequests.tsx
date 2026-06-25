import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Phone, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { useFirebaseData } from '../../contexts/FirebaseContext';
import { useFirebase } from '../../hooks/useFirebase';
import { HireRequest } from '../../types';
import { cn } from '../../lib/utils';

export default function HireRequests() {
  const { hireRequests, userProfile, isActionLoading } = useFirebaseData() as any;
  const { respondToHireRequest } = useFirebase();
  const isWorker = userProfile?.role === 'worker';

  const pending = (hireRequests || []).filter((r: HireRequest) => r.status === 'pending');
  const history = (hireRequests || []).filter((r: HireRequest) => r.status !== 'pending');

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-2 text-brand-ink">
          {isWorker ? 'Job Requests' : 'Manage Hiring'}
        </h1>
        <p className="text-brand-muted">
          {isWorker ? 'Direct hire offers from contractors and companies.' : 'Track and manage hire requests sent to workers.'}
        </p>
      </header>

      {/* Pending Requests */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
          <h2 className="text-sm font-black uppercase tracking-widest text-brand-ink">
            {isWorker ? `Active Offers (${pending.length})` : `Sent - Pending Response (${pending.length})`}
          </h2>
        </div>

        {pending.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pending.map((request: HireRequest) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "bg-white p-8 rounded-[2.5rem] border-2 shadow-xl relative overflow-hidden",
                  isWorker ? "border-brand-primary/20 shadow-brand-primary/5" : "border-orange-200 shadow-orange-500/5"
                )}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className={cn(
                      "text-[10px] font-black uppercase tracking-widest mb-1",
                      isWorker ? "text-brand-primary" : "text-orange-500"
                    )}>
                      {isWorker ? "New Job Offer" : "Pending Request"}
                    </div>
                    <h3 className="text-2xl font-black text-brand-ink uppercase leading-tight">{request.jobTitle}</h3>
                  </div>
                  <div className="p-3 bg-brand-paper rounded-2xl text-brand-muted">
                    <Briefcase size={20} />
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-paper rounded-full flex items-center justify-center text-brand-ink">
                      {isWorker ? <Briefcase size={14} /> : <CheckCircle size={14} />}
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-brand-muted">
                        {isWorker ? "Contractor" : "Worker Name"}
                      </div>
                      <div className="text-sm font-bold text-brand-ink">
                        {isWorker ? request.contractorName : request.workerName}
                      </div>
                    </div>
                  </div>

                  {isWorker && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-paper rounded-full flex items-center justify-center text-brand-ink">
                          <Phone size={14} />
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase text-brand-muted">Phone Number</div>
                          <div className="text-sm font-bold text-brand-ink">{request.contractorPhone || 'Verifying...'}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-paper rounded-full flex items-center justify-center text-brand-ink">
                          <MapPin size={14} />
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase text-brand-muted">Work Location</div>
                          <div className="text-sm font-bold text-brand-ink">{request.contractorLocation || 'Contact for details'}</div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {!isWorker && (
                    <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 italic text-[10px] text-orange-600 font-bold uppercase tracking-wider">
                      Waiting for worker to review and respond to this request.
                    </div>
                  )}
                </div>

                {isWorker ? (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      disabled={isActionLoading}
                      onClick={() => respondToHireRequest(request.id, 'accepted')}
                      className="bg-brand-ink text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-primary transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} /> Accept
                    </button>
                    <button
                      disabled={isActionLoading}
                      onClick={() => respondToHireRequest(request.id, 'declined')}
                      className="bg-white border border-brand-ink/10 text-brand-muted py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} /> Decline
                    </button>
                  </div>
                ) : (
                  <button
                    disabled={isActionLoading}
                    onClick={() => respondToHireRequest(request.id, 'declined')}
                    className="w-full bg-white border border-orange-200 text-orange-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-500 hover:text-white transition-all"
                  >
                    Cancel Request
                  </button>
                )}

                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[2.5rem] border border-dashed border-brand-ink/10 text-center">
            <div className="w-16 h-16 bg-brand-paper rounded-full flex items-center justify-center text-brand-muted mx-auto mb-4">
              <Clock size={32} />
            </div>
            <h3 className="text-lg font-black text-brand-ink uppercase mb-2">No {isWorker ? 'Active Offers' : 'Pending Requests'}</h3>
            <p className="text-sm text-brand-muted max-w-sm mx-auto">
              {isWorker 
                ? 'Build your Trust Score by completing verified jobs to attract more hire requests.'
                : 'Scout available workers in the Search section to send new hire requests.'}
            </p>
          </div>
        )}
      </section>

      {/* History */}
      {history.length > 0 && (
        <section>
          <h2 className="text-sm font-black uppercase tracking-widest text-brand-muted mb-4">Request History</h2>
          <div className="bg-white rounded-[2.5rem] border border-brand-ink/5 overflow-hidden">
            {history.map((request: HireRequest) => (
              <div key={request.id} className="p-6 border-b border-brand-ink/5 flex items-center justify-between hover:bg-brand-paper/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    request.status === 'accepted' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                  )}>
                    {request.status === 'accepted' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                  </div>
                  <div>
                    <div className="font-black text-brand-ink uppercase text-sm">{request.jobTitle}</div>
                    <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{request.contractorName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-1",
                    request.status === 'accepted' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                  )}>
                    {request.status}
                  </div>
                  <div className="text-[10px] text-brand-muted font-bold">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
