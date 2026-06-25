import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Calendar, IndianRupee, MapPin, ExternalLink, ShieldCheck, ArrowLeft, TrendingUp, Star, Printer, Download, CheckCircle2 } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile, WorkEntry, OrganizationProfile } from '../../types';
import Analysis from './Analysis';
import WorkHistory from './WorkHistory';
import { useFirebase } from '../../hooks/useFirebase';
import { jsPDF } from 'jspdf';
import { cn } from '../../lib/utils';

interface WorkerSearchProps {
  initialQuery?: string;
}

export default function WorkerSearch({ initialQuery }: WorkerSearchProps) {
  const { userProfile, toggleShortlist, sendHireRequest, isActionLoading } = useFirebase();
  const orgProfile = userProfile as OrganizationProfile;
  const isContractor = userProfile?.role === 'contractor';
  const shortlist = orgProfile?.shortlist || [];
  
  const [searchTerm, setSearchTerm] = useState(initialQuery || '');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<UserProfile | null>(null);
  const [workerEntries, setWorkerEntries] = useState<WorkEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'profile' | 'analysis' | 'history'>('profile');
  const [hireStatus, setHireStatus] = useState<Record<string, boolean>>({});

  const [realWorkers, setRealWorkers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchAvailableWorkers = async () => {
      const workersRef = collection(db, 'users');
      const q = query(workersRef, where('role', '==', 'worker'), limit(6));
      const snap = await getDocs(q);
      const workers = snap.docs.map(d => d.data() as UserProfile);
      setRealWorkers(workers);
    };
    fetchAvailableWorkers();
  }, []);

  const handleHireClick = async (worker: UserProfile) => {
    const success = await sendHireRequest(worker.uid, worker.name, 'Direct Hire via Search');
    if (success) {
      setHireStatus(prev => ({ ...prev, [worker.uid]: true }));
      setTimeout(() => {
        setHireStatus(prev => ({ ...prev, [worker.uid]: false }));
      }, 3000);
    }
  };

  const handlePrint = () => {
    // Specialized print function for better layout and iframe compatibility
    if (!selectedWorker) return;
    
    // Calculate trust score for print
    const verifiedCount = workerEntries.filter(e => e.status === 'verified').length;
    const baseScore = 750 + (selectedWorker.isVerified ? 100 : 0);
    const trustScore = Math.min(Math.max(baseScore + (verifiedCount * 15), 300), 1000);

    const content = `
      <html>
        <head>
          <title>Karmik Setu - Worker Report</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #141414; }
            .header { border-bottom: 3px solid #141414; padding-bottom: 20px; margin-bottom: 40px; }
            .title { font-size: 24px; font-weight: 900; text-transform: uppercase; }
            .profile-grid { display: grid; grid-template-cols: 150px 1fr; gap: 40px; margin-bottom: 40px; }
            .photo-box { width: 150px; height: 150px; background: #eee; border-radius: 20px; overflow: hidden; }
            .photo-box img { width: 100%; height: 100%; object-fit: cover; }
            .label { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #999; margin-bottom: 4px; }
            .value { font-size: 16px; font-weight: 700; margin-bottom: 15px; }
            .stats-row { display: grid; grid-template-cols: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
            .stat-card { background: #f9f9f7; padding: 20px; border-radius: 20px; border: 1px solid #eee; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th { text-align: left; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #999; padding: 12px 8px; border-bottom: 2px solid #eee; }
            .table td { padding: 12px 8px; border-bottom: 1px solid #f0f0f0; font-size: 12px; font-weight: 600; }
            .verified { color: #059669; font-weight: 900; font-size: 10px; text-transform: uppercase; }
            .footer { margin-top: 60px; text-align: center; font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.2em; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Official Worker Profile Report</div>
          </div>
          
          <div class="profile-grid">
            <div class="photo-box">
              <img src="${selectedWorker.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedWorker.uid}`}" />
            </div>
            <div>
              <div class="label">Full Name</div>
              <div class="value" style="font-size: 24px;">${selectedWorker.name}</div>
              <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px;">
                <div>
                  <div class="label">Setu ID</div>
                  <div class="value">${selectedWorker.setuId}</div>
                </div>
                <div>
                  <div class="label">Aadhaar</div>
                  <div class="value">${selectedWorker.aadhaarFull || selectedWorker.aadhaarMasked}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="stats-row">
            <div class="stat-card">
              <div class="label">Trust Score</div>
              <div class="value">${trustScore} / 1000</div>
            </div>
            <div class="stat-card">
              <div class="label">Days Worked</div>
              <div class="value">${selectedWorker.totalDaysWorked}</div>
            </div>
            <div class="stat-card">
              <div class="label">Total Earnings</div>
              <div class="value">Rs. ${selectedWorker.totalEarnings.toLocaleString()}</div>
            </div>
          </div>

          <div class="label">Recent Service Ledger</div>
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Work Type</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${workerEntries.slice(0, 10).map(e => `
                <tr>
                  <td>${new Date(e.date).toLocaleDateString()}</td>
                  <td>${e.workType}</td>
                  <td>${e.location}</td>
                  <td class="verified">${e.status?.toUpperCase() || 'VERIFIED'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">This report is an automated digital verification from the Karmik Setu registry.</div>
        </body>
      </html>
    `;

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (frameDoc) {
      frameDoc.write(content);
      frameDoc.close();
      setTimeout(() => {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
        setTimeout(() => document.body.removeChild(printFrame), 1000);
      }, 500);
    }
  };

  const handleDownloadReport = (worker: UserProfile, entries: WorkEntry[]) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('KARMIK SETU - WORKER REPORT', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`Official Service Record for ${worker.name}`, 105, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Setu ID: ${worker.setuId}`, 20, 50);
    doc.text(`Total Days Worked: ${worker.totalDaysWorked}`, 20, 60);
    doc.text(`Total Earnings: Rs. ${worker.totalEarnings.toLocaleString()}`, 20, 70);
    
    doc.text('Work History:', 20, 90);
    let y = 100;
    entries.slice(0, 15).forEach(entry => {
      doc.setFontSize(10);
      doc.text(`${entry.date} - ${entry.workType} - Rs. ${entry.paymentReceived}`, 25, y);
      y += 8;
    });
    
    doc.save(`worker-report-${worker.setuId}.pdf`);
  };

  const executeSearch = async (queryStr: string) => {
    if (!queryStr) return;

    setIsLoading(true);
    setError(null);
    setResults([]);
    setSelectedWorker(null);

    try {
      // Try searching by SetuId first
      let q = query(
        collection(db, 'users'), 
        where('role', '==', 'worker'),
        where('setuId', '==', queryStr.toUpperCase())
      );
      
      let querySnapshot = await getDocs(q);
      let workers = querySnapshot.docs.map(doc => doc.data() as UserProfile);
      
      if (workers.length === 0) {
        // Fallback to name search
        q = query(
          collection(db, 'users'), 
          where('role', '==', 'worker'),
          where('name', '>=', queryStr),
          where('name', '<=', queryStr + '\uf8ff'),
          limit(10)
        );
        querySnapshot = await getDocs(q);
        workers = querySnapshot.docs.map(doc => doc.data() as UserProfile);
      }
      
      if (workers.length === 0) {
        setError('No workers found with that ID or Name.');
      }
      setResults(workers);
      
      // If exactly one match by ID, open it directly
      if (workers.length === 1 && workers[0].setuId === queryStr.toUpperCase()) {
        viewWorkerDetails(workers[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Search failed. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchTerm);
  };

  const viewWorkerDetails = async (worker: UserProfile) => {
    setIsLoading(true);
    setSelectedWorker(worker);
    setViewMode('profile');
    
    try {
      const entriesRef = collection(db, `users/${worker.uid}/workEntries`);
      const snapshot = await getDocs(entriesRef);
      const entries = snapshot.docs.map(doc => doc.data() as WorkEntry);
      setWorkerEntries(entries);
    } catch (err) {
      console.error(err);
      setError('Could not fetch work history.');
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedWorker) {
    const mockTranslation = {
      profile: 'Worker Profile',
      analysis: 'Performance Analysis',
      history: 'Full Work History',
      analysisDesc: 'Detailed metrics based on verified service records.',
      skillLevel: 'Reliability Score',
      totalEarnings: 'Total Verified Earnings',
      earningsHistory: 'Monthly Earnings Trend',
      workDistribution: 'Service Category Mix',
      strategyTip: 'Insight',
      strategyDesc: 'This worker maintains a higher-than-average retention rate in construction and plumbing sectors.',
      allHistory: 'Historical Work Logs',
      historyDesc: 'A ledger of all verified tasks and payments.',
      date: 'Date',
      category: 'Category',
      hours: 'Hours',
      earnings: 'Earnings',
      location: 'Location',
      status: 'Status',
      noRecordsFound: 'No records available'
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedWorker(null)}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-muted hover:text-brand-ink transition-colors"
          >
            <ArrowLeft size={16} /> Back to Search
          </button>
          
          <div className="flex bg-brand-paper p-1 rounded-xl items-center gap-2">
            {(['profile', 'analysis', 'history'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  viewMode === mode ? 'bg-brand-ink text-white shadow-lg' : 'text-brand-muted hover:text-brand-ink'
                }`}
              >
                {mode}
              </button>
            ))}
            <div className="w-[1px] h-4 bg-brand-ink/10 mx-1" />
            <button
              onClick={() => handleDownloadReport(selectedWorker, workerEntries)}
              className="p-2 rounded-lg text-brand-muted hover:text-brand-ink hover:bg-white transition-all group relative"
              title="Download Report (PDF)"
            >
              <Download size={16} />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-brand-ink text-white text-[8px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg text-brand-muted hover:text-brand-ink hover:bg-white transition-all group relative"
              title="Print Worker Report"
            >
              <Printer size={16} />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-brand-ink text-white text-[8px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Print Report</span>
            </button>
          </div>
        </div>

        <motion.div 
          key={viewMode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {viewMode === 'profile' && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-brand-ink/5 transition-all print:p-0 print:border-none">
              {/* Print Header - Only visible when printing */}
              <div className="hidden print:block mb-8 text-center border-b-2 border-brand-ink pb-6">
                <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Karmik Setu - Official Worker Report</h1>
                <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">Digital Service Record & Verification Document</p>
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-brand-paper rounded-[2rem] flex items-center justify-center text-brand-ink/20 relative overflow-hidden border-2 border-brand-ink/5 shadow-inner">
                    {selectedWorker.photoUrl ? (
                      <img src={selectedWorker.photoUrl} alt={selectedWorker.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={40} />
                    )}
                    <button 
                      onClick={() => toggleShortlist(selectedWorker.setuId)}
                      className={`absolute -top-2 -right-2 p-2 rounded-full border border-white shadow-lg transition-all ${
                        shortlist.includes(selectedWorker.setuId) ? 'bg-yellow-400 text-white' : 'bg-white text-brand-muted hover:text-yellow-500'
                      }`}
                    >
                      <Star size={16} fill={shortlist.includes(selectedWorker.setuId) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-brand-ink">{selectedWorker.name}</h2>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-brand-muted uppercase tracking-widest text-[10px] flex items-center gap-1">
                         ID: <span className="text-brand-ink">{selectedWorker.setuId}</span>
                      </p>
                      <p className="font-bold text-brand-muted uppercase tracking-widest text-[10px] flex items-center gap-1">
                        <ShieldCheck size={12} className="text-green-600" /> Verified 
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="bg-brand-paper px-6 py-4 rounded-3xl text-center">
                    <div className="text-xl font-black text-brand-ink">{selectedWorker.totalDaysWorked}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Days Worked</div>
                  </div>
                  <div className="bg-brand-paper px-6 py-4 rounded-3xl text-center">
                    <div className="text-xl font-black text-brand-ink">₹{selectedWorker.totalEarnings.toLocaleString()}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Total Earned</div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 border-t border-brand-ink/5 pt-8">
                <div className="space-y-6">
                  <h3 className="font-black uppercase tracking-widest text-sm text-brand-muted">Government Identity</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-brand-muted">Aadhaar Number</span>
                      <span className="font-bold tracking-widest text-brand-ink">{selectedWorker.aadhaarFull || selectedWorker.aadhaarMasked}</span>
                    </div>
                    {selectedWorker.pan && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-brand-muted">PAN Card</span>
                        <span className="font-bold tracking-widest text-brand-ink uppercase">{selectedWorker.pan}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-brand-muted">Registered Email</span>
                      <span className="font-bold text-brand-ink">{selectedWorker.email}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-brand-muted">Mobile Number</span>
                      <span className="font-bold text-brand-ink">{selectedWorker.phone}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-brand-muted">Preferred Language</span>
                      <span className="font-bold uppercase tracking-widest text-brand-ink">{selectedWorker.preferredLanguage}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-paper/50 p-8 rounded-[2rem] border border-brand-ink/5">
                  <h3 className="font-black uppercase tracking-widest text-sm text-brand-muted mb-6">Financial Verdict</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center">
                        <TrendingUp size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-black uppercase tracking-tight text-brand-ink">Prime Creditable</div>
                        <div className="text-[10px] text-brand-muted font-bold">Recommended for MICRO-LOANS up to ₹50k</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-black uppercase tracking-tight text-brand-ink">Geographic Stability</div>
                        <div className="text-[10px] text-brand-muted font-bold">Consistently working in {selectedWorker.address || 'Verified Hubs'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work History for Print */}
              <div className="hidden print:block mt-12 pt-8 border-t-2 border-brand-ink/10">
                <h3 className="font-black uppercase tracking-widest text-sm text-brand-muted mb-6">Recent Verified Work History</h3>
                <div className="space-y-4">
                  {workerEntries.length > 0 ? (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-brand-ink/10">
                          <th className="py-2 font-black uppercase tracking-widest text-[10px] text-brand-muted">Date</th>
                          <th className="py-2 font-black uppercase tracking-widest text-[10px] text-brand-muted">Category</th>
                          <th className="py-2 font-black uppercase tracking-widest text-[10px] text-brand-muted">Work Type</th>
                          <th className="py-2 font-black uppercase tracking-widest text-[10px] text-brand-muted">Earnings</th>
                          <th className="py-2 font-black uppercase tracking-widest text-[10px] text-brand-muted">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workerEntries.slice(0, 10).map((entry, idx) => (
                          <tr key={idx} className="border-b border-brand-ink/5">
                            <td className="py-2 font-medium">{new Date(entry.date).toLocaleDateString()}</td>
                            <td className="py-2">{entry.category}</td>
                            <td className="py-2">{entry.workType}</td>
                            <td className="py-2 font-bold">₹{entry.paymentReceived}</td>
                            <td className="py-2 uppercase text-[10px] font-black">{entry.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-sm italic text-brand-muted">No verified work entries found.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'analysis' && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-brand-ink/5">
              <Analysis entries={workerEntries} t={mockTranslation} />
            </div>
          )}

          {viewMode === 'history' && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-brand-ink/5">
              <WorkHistory entries={workerEntries} t={mockTranslation} />
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-2 text-brand-ink">
          {isContractor ? 'Hire Workers' : 'Find Workers'}
        </h1>
        <p className="text-brand-muted">
          {isContractor ? 'Find skilled laborers and send direct hire requests.' : 'Search for laborers and verify their digital identity and work performance.'}
        </p>
      </header>

      {/* Available Now Section - Only for contractors and organizations */}
      {(isContractor || userProfile?.role === 'organization') && (
        <section className="bg-orange-50 p-8 rounded-[2.5rem] border border-orange-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black uppercase text-brand-ink flex items-center gap-2">
                <TrendingUp className="text-orange-500" />
                Available for Hire
              </h2>
              <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">Workers active in your region</p>
            </div>
            <span className="bg-orange-500 text-white text-[9px] font-black px-3 py-1 rounded-full animate-pulse">LIVE DISCOVERY</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {realWorkers.length > 0 ? realWorkers.map((w, i) => (
              <div key={w.uid} className="bg-white p-6 rounded-[2rem] border border-orange-200 shadow-sm hover:scale-[1.02] transition-all group overflow-hidden relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center font-black text-orange-600">
                    {w.name.charAt(0)}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-brand-muted uppercase">Trust Score</div>
                    <div className="text-lg font-black text-brand-ink">
                      {750 + (w.isVerified ? 100 : 0) + (w.totalDaysWorked * 5)}
                    </div>
                  </div>
                </div>
                <h4 className="font-black text-brand-ink text-sm mb-1">{w.name}</h4>
                <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-4">
                  {w.totalDaysWorked} Days Worked • {w.gender || 'Verified'}
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHireClick(w);
                  }}
                  disabled={isActionLoading || hireStatus[w.uid]}
                  className={cn(
                    "w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    hireStatus[w.uid]
                      ? "bg-emerald-500 text-white"
                      : "bg-brand-ink text-white hover:bg-orange-500 shadow-md"
                  )}
                >
                  {hireStatus[w.uid] ? 'Request Sent' : 'Send Hire Request'}
                </button>
                
                {hireStatus[w.uid] && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center pointer-events-none"
                  >
                     <CheckCircle2 className="text-emerald-500" size={40} />
                  </motion.div>
                )}
              </div>
            )) : (
              <div className="col-span-full py-12 text-center bg-white rounded-[2rem] border border-dashed border-orange-200">
                <p className="text-sm font-bold text-brand-muted italic">No active workers found in your immediate vicinity. Try searching manually.</p>
              </div>
            )}
          </div>
        </section>
      )}
      <div className="bg-white p-8 rounded-[2.5rem] border border-brand-ink/5 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by full name or ID (e.g. SS-1234)" 
              className="w-full bg-brand-paper border-none rounded-[1.5rem] py-5 pl-14 pr-6 focus:ring-2 focus:ring-brand-ink transition-all font-medium text-brand-ink placeholder:text-brand-muted/50"
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="bg-brand-ink text-white px-10 rounded-[1.5rem] font-bold hover:bg-black transition-all disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Find'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-500 rounded-2xl flex items-center gap-3 border border-red-100 italic text-sm">
            {error}
          </div>
        )}
      </div>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {results.map((worker) => (
              <button
                key={worker.uid}
                onClick={() => viewWorkerDetails(worker)}
                className="bg-white p-6 rounded-[2rem] border border-brand-ink/10 hover:border-brand-ink/30 transition-all text-left flex items-center gap-6 group"
              >
                <div className="w-16 h-16 bg-brand-paper rounded-2xl flex items-center justify-center text-brand-ink/10 shrink-0 overflow-hidden border border-brand-ink/5">
                  {worker.photoUrl ? (
                    <img src={worker.photoUrl} alt={worker.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={32} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-black uppercase tracking-tight text-xl mb-1 text-brand-ink">{worker.name}</h3>
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                    <span className="flex items-center gap-1"><IndianRupee size={10} /> {worker.totalEarnings.toLocaleString()} Earned</span>
                    <span className="flex items-center gap-1"><Calendar size={10} /> {worker.totalDaysWorked} Days</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(isContractor || userProfile?.role === 'organization') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHireClick(worker);
                      }}
                      disabled={isActionLoading || hireStatus[worker.uid]}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        hireStatus[worker.uid] 
                          ? "bg-emerald-500 text-white" 
                          : "bg-brand-ink text-white hover:bg-orange-500 shadow-lg shadow-black/10"
                      )}
                    >
                      {hireStatus[worker.uid] ? 'Request Sent' : 'Hire'}
                    </button>
                  )}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleShortlist(worker.setuId);
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      shortlist.includes(worker.setuId) ? 'bg-yellow-100 text-yellow-600' : 'bg-brand-paper text-brand-muted hover:text-yellow-500'
                    }`}
                  >
                    <Star size={18} fill={shortlist.includes(worker.setuId) ? 'currentColor' : 'none'} />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-brand-ink/5 flex items-center justify-center group-hover:bg-brand-ink group-hover:text-white transition-all">
                    <ExternalLink size={18} />
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
