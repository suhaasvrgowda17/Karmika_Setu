import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Landmark, Activity, Globe, ArrowUpRight, Target, Search, 
  User, ShieldCheck, TrendingUp, CreditCard, PieChart as PieIcon,
  X, Briefcase, MapPin, Calendar, Star, Fingerprint, Printer, Download
} from 'lucide-react';
import { OrganizationProfile, UserProfile, WorkEntry } from '../../types';
import { useFirebase } from '../../hooks/useFirebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { jsPDF } from 'jspdf';

interface OrgDashboardProps {
  profile: OrganizationProfile;
}

export default function OrgDashboard({ profile }: OrgDashboardProps) {
  const { stats } = useFirebase();
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<{
    profile: UserProfile;
    history: WorkEntry[];
  } | null>(null);
  const [error, setError] = useState('');

  const statsDisplay = [
    { label: 'Monitored Workers', value: stats.totalWorkers.toLocaleString(), icon: Users, color: 'bg-brand-ink', trend: '+12.5%' },
    { label: 'Capital Deployed', value: '₹8.4 Cr', icon: Landmark, color: 'bg-brand-ink', trend: '+5.2%' },
    { label: 'System Credit Score', value: '732', icon: Activity, color: 'bg-brand-ink', trend: 'Stable' },
    { label: 'ESG Compliance', value: '94%', icon: Globe, color: 'bg-brand-ink', trend: '+2.1%' },
  ];

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setIsSearching(true);
    setError('');
    try {
      const formattedId = searchId.trim().toUpperCase();
      // 1. Resolve Setu ID to UID
      const setuRef = doc(db, `uniques/setuIds/entries/${formattedId}`);
      const setuSnap = await getDoc(setuRef);
      
      if (!setuSnap.exists()) {
        throw new Error('Karmik ID not found. Please double check.');
      }

      const uid = setuSnap.data().userId;

      // 2. Get Profile
      const profileSnap = await getDoc(doc(db, 'users', uid));
      if (!profileSnap.exists()) throw new Error('Worker profile missing');
      
      const workerProfile = profileSnap.data() as UserProfile;

      // 3. Get Work History
      const entriesRef = collection(db, `users/${uid}/workEntries`);
      const entriesSnap = await getDocs(entriesRef);
      const history = entriesSnap.docs.map(d => d.data() as WorkEntry)
        .sort((a, b) => b.createdAt - a.createdAt);

      setSelectedWorker({ profile: workerProfile, history });
      setSearchId('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadWorkerPDF = (worker: UserProfile, history: WorkEntry[]) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('KARMIK SETU - WORKER PROFILE', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`Official Verified Record for ${worker.name}`, 105, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Setu ID: ${worker.setuId}`, 20, 50);
    doc.text(`Aadhaar: ${worker.aadhaarFull || worker.aadhaarMasked}`, 20, 60);
    doc.text(`Total Days Worked: ${worker.totalDaysWorked}`, 20, 70);
    doc.text(`Total Verified Earnings: Rs. ${worker.totalEarnings.toLocaleString()}`, 20, 80);
    doc.text(`Trust Score: ${calculateTrustScore(history)}`, 20, 90);
    
    doc.text('Recent Work History:', 20, 110);
    let y = 120;
    history.slice(0, 10).forEach(entry => {
      doc.setFontSize(10);
      doc.text(`${new Date(entry.date).toLocaleDateString()} - ${entry.workType} (${entry.category}) - Rs. ${entry.paymentReceived}`, 25, y);
      y += 8;
    });
    
    doc.save(`worker-report-${worker.setuId}.pdf`);
  };

  const handlePrint = () => {
    // Specialized print function for better layout and iframe compatibility
    if (!selectedWorker) return;
    
    const content = `
      <html>
        <head>
          <title>Karmik Setu - Worker Profile</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #141414; }
            .header { border-bottom: 3px solid #141414; padding-bottom: 20px; margin-bottom: 40px; }
            .title { font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; }
            .subtitle { font-size: 12px; color: #666; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
            .profile-grid { display: grid; grid-template-cols: 150px 1fr; gap: 40px; margin-bottom: 40px; }
            .photo-box { width: 150px; height: 150px; background: #eee; border-radius: 20px; overflow: hidden; }
            .photo-box img { width: 100%; height: 100%; object-cover; }
            .info-group { margin-bottom: 20px; }
            .label { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #999; letter-spacing: 0.1em; margin-bottom: 4px; }
            .value { font-size: 16px; font-weight: 700; }
            .stats-row { display: grid; grid-template-cols: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
            .stat-card { background: #f9f9f7; padding: 20px; border-radius: 20px; border: 1px solid #eee; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th { text-align: left; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #999; padding: 12px 8px; border-bottom: 2px solid #eee; }
            .table td { padding: 12px 8px; border-bottom: 1px solid #f0f0f0; font-size: 12px; font-weight: 600; }
            .verified { color: #059669; font-weight: 900; font-size: 10px; text-transform: uppercase; }
            .footer { margin-top: 60px; text-align: center; font-size: 10px; color: #999; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Karmik Setu Worker Record</div>
            <div class="subtitle">Official Verified Employment & Identity Profile</div>
          </div>
          
          <div class="profile-grid">
            <div class="photo-box">
              <img src="${selectedWorker.profile.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedWorker.profile.uid}`}" />
            </div>
            <div>
              <div class="info-group">
                <div class="label">Full Name</div>
                <div class="value" style="font-size: 24px;">${selectedWorker.profile.name}</div>
              </div>
              <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px;">
                <div class="info-group">
                  <div class="label">Setu ID</div>
                  <div class="value">${selectedWorker.profile.setuId}</div>
                </div>
                <div class="info-group">
                  <div class="label">Aadhaar (Verified)</div>
                  <div class="value">${selectedWorker.profile.aadhaarFull || selectedWorker.profile.aadhaarMasked}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="stats-row">
            <div class="stat-card">
              <div class="label">Trust Score</div>
              <div class="value">${calculateTrustScore(selectedWorker.history)} / 1000</div>
            </div>
            <div class="stat-card">
              <div class="label">Work Days</div>
              <div class="value">${selectedWorker.history.length}</div>
            </div>
            <div class="stat-card">
              <div class="label">Verified Status</div>
              <div class="value">Authenticated</div>
            </div>
          </div>

          <div class="label">Recent Service Ledger</div>
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Work Type</th>
                <th>Pay</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${selectedWorker.history.slice(0, 10).map(e => `
                <tr>
                  <td>${new Date(e.date).toLocaleDateString()}</td>
                  <td>${e.category}</td>
                  <td>${e.workType}</td>
                  <td>Rs. ${e.paymentReceived}</td>
                  <td class="verified">${e.status?.toUpperCase() || 'VERIFIED'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">This report is an automated digital verification of the worker's history from the Karmik Setu registry.</div>
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

  const handleDownloadESG = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('ESG IMPACT REPORT', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text(profile.orgName, 105, 30, { align: 'center' });
    doc.text('Karmik Setu Organization Portal', 105, 38, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Report Period: Q2 2024`, 20, 55);
    doc.text(`Total Monitored Workers: ${stats.totalWorkers}`, 20, 65);
    doc.text(`Capital Deployed: Rs. 8.4 Cr`, 20, 75);
    doc.text(`System Credit Score: 732`, 20, 85);
    doc.text(`Social Impact Score: 85/100`, 20, 95);
    
    doc.save(`esg-report-${profile.orgName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  const calculateTrustScore = (history: WorkEntry[]) => {
    if (history.length === 0) return 600;
    const verified = history.filter(h => h.status === 'verified').length;
    const ratio = verified / history.length;
    return Math.floor(600 + (ratio * 250));
  };

  const prepareChartData = (history: WorkEntry[]) => {
    const monthly = history.reduce((acc: any, curr) => {
      const month = new Date(curr.date).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + (curr.hoursWorked || 8);
      return acc;
    }, {});
    
    return Object.entries(monthly).map(([name, hours]) => ({ name: name as string, hours: hours as number }));
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display font-black text-3xl uppercase tracking-tight text-brand-ink">
              {profile.orgName}
            </h1>
            <span className="px-3 py-1 bg-brand-ink text-white text-[10px] font-black rounded-full tracking-widest uppercase">
              Organization Portal
            </span>
          </div>
          <p className="text-brand-muted">Financial Oversight & Workforce Credit Intelligence</p>
        </div>
      </header>

      {/* Lookup Bar */}
      <div className="bg-white p-2 rounded-[2rem] border border-brand-ink/5 shadow-sm flex flex-col md:flex-row gap-2">
        <form onSubmit={handleLookup} className="flex-1 flex items-center relative">
          <Search className="absolute left-6 text-brand-muted" size={20} />
          <input 
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Search Karmik by ID (e.g. SS-XXXXX)"
            className="w-full bg-transparent border-none py-6 pl-16 pr-6 focus:ring-0 font-display font-bold text-lg uppercase tracking-wider"
          />
        </form>
        <button 
          onClick={handleLookup}
          disabled={isSearching}
          className="bg-brand-ink text-white px-12 py-4 md:py-0 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 transition-colors disabled:opacity-50"
        >
          {isSearching ? 'Analyzing...' : 'Fetch Credit Profile'}
        </button>
      </div>
      {error && <p className="text-rose-500 text-xs font-bold uppercase tracking-widest px-4">{error}</p>}

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsDisplay.map((stat, i) => (
          <motion.div
            key={`${stat.label}-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-brand-ink/5 shadow-sm relative overflow-hidden"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white mb-6`}>
              <stat.icon size={24} />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-brand-ink tracking-tight">{stat.value}</div>
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-black uppercase tracking-widest text-brand-muted">{stat.label}</div>
                <div className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                  <ArrowUpRight size={10} /> {stat.trend}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 border border-brand-ink/5 relative overflow-hidden">
            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 text-brand-ink">
              <Target className="text-brand-ink" />
              Market Readiness Index
            </h2>
            <div className="space-y-8">
              <div className="p-8 bg-brand-paper rounded-3xl border border-brand-ink/5">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-brand-ink">Verified Work Adoption</h4>
                    <p className="text-xs text-brand-muted uppercase font-bold">Growth in digital work attestation across regions</p>
                  </div>
                  <div className="text-2xl font-black text-brand-ink">88%</div>
                </div>
                <div className="h-4 w-full bg-white rounded-full overflow-hidden p-1 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '88%' }}
                    className="h-full bg-brand-ink rounded-full"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-6 bg-brand-paper rounded-3xl border border-brand-ink/5">
                  <TrendingUp className="mb-4 opacity-30" size={20} />
                  <div className="text-2xl font-black mb-1">₹12.5k</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Avg Monthly Payout Per Worker</div>
                </div>
                <div className="p-6 bg-brand-paper rounded-3xl border border-brand-ink/5">
                  <ShieldCheck className="mb-4 opacity-30" size={20} />
                  <div className="text-2xl font-black mb-1">0.8%</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Systemic Risk Delta (YTD)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-brand-ink rounded-[2.5rem] p-10 text-white relative overflow-hidden min-h-[400px] flex flex-col justify-between">
            <div className="relative z-10">
              <h2 className="text-xl font-black uppercase mb-4">Organization Impact</h2>
              <p className="text-white/60 text-sm mb-8 leading-relaxed">
                Your participation in the Karmik Setu ecosystem has enabled formal credit access for over 450 unorganized sector workers this quarter.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <PieIcon size={20} />
                  </div>
                  <div>
                    <div className="text-lg font-black tracking-tight">+14.2%</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Portfolio Diversification</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <div className="text-lg font-black tracking-tight">850+</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Verified Credit Profiles</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative z-10 pt-12">
              <button 
                onClick={handleDownloadESG}
                className="w-full bg-white text-brand-ink py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#F5F5F0] transition-all"
              >
                Download ESG Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Worker Detail Modal */}
      <AnimatePresence>
        {selectedWorker && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-brand-ink/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ y: 50, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.9 }}
              className="bg-brand-paper w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-8 md:p-12 relative print:max-h-none print:overflow-visible print:bg-white print:p-0 print:border-none"
            >
              <div className="absolute right-8 top-8 flex gap-3 z-30 print:hidden">
                <button 
                  onClick={() => handleDownloadWorkerPDF(selectedWorker.profile, selectedWorker.history)}
                  className="p-3 bg-brand-paper border border-brand-ink/10 text-brand-ink rounded-full hover:bg-brand-ink hover:text-white transition-all group relative shadow-lg"
                >
                  <Download size={20} />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-brand-ink text-white text-[8px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-black uppercase">Download PDF</span>
                </button>
                <button 
                  onClick={handlePrint}
                  className="p-3 bg-brand-paper border border-brand-ink/10 text-brand-ink rounded-full hover:bg-brand-ink hover:text-white transition-all group relative shadow-lg"
                >
                  <Printer size={20} />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-brand-ink text-white text-[8px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-black uppercase">Print ID Card</span>
                </button>
                <button 
                  onClick={() => setSelectedWorker(null)}
                  className="p-3 bg-brand-ink text-white rounded-full hover:bg-orange-500 transition-all shadow-lg"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Print Header - Only visible when printing */}
              <div className="hidden print:block mb-8 text-center border-b-2 border-brand-ink pb-6">
                <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Karmik Setu - Organization Verification</h1>
                <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">Official Worker Service & Identity Record</p>
              </div>

              <div className="grid lg:grid-cols-12 gap-12">
                {/* Side: Basic Info */}
                <div className="lg:col-span-4 space-y-8">
                  <div className="relative group">
                    <div className="aspect-[1/1] bg-brand-ink rounded-[2rem] overflow-hidden grayscale group-hover:grayscale-0 transition-all border-4 border-white shadow-2xl">
                      <img 
                        src={selectedWorker.profile.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedWorker.profile.uid}`}
                        alt="Worker"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-2xl shadow-xl border border-brand-ink/5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Star className="text-orange-500 fill-orange-500" size={16} />
                        <span className="font-black text-brand-ink tracking-tight">Trust Score: {calculateTrustScore(selectedWorker.history)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Full Name</h3>
                      <p className="text-2xl font-black text-brand-ink">{selectedWorker.profile.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Fingerprint className="text-brand-muted" size={18} />
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Setu ID</h4>
                        <p className="font-bold text-brand-ink uppercase">{selectedWorker.profile.setuId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="text-brand-muted" size={18} />
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Aadhaar Number</h4>
                        <p className="font-bold text-brand-ink">{selectedWorker.profile.aadhaarFull || selectedWorker.profile.aadhaarMasked}</p>
                        {selectedWorker.profile.pan && (
                          <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">PAN: <span className="text-brand-ink">{selectedWorker.profile.pan}</span></p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="text-brand-muted" size={18} />
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Location</h4>
                        <p className="font-bold text-brand-ink">{selectedWorker.profile.address || 'Verified (Delhi NCR)'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main: Analysis */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black uppercase tracking-tight text-brand-ink">Credit Intelligence</h2>
                    <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                      <ShieldCheck size={14} /> KYC Verified
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-3xl border border-brand-ink/5">
                      <Calendar className="text-brand-muted mb-4" size={20} />
                      <div className="text-xl font-black">{selectedWorker.history.length}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Work Entries</div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-brand-ink/5">
                      <ShieldCheck className="text-emerald-500 mb-4" size={20} />
                      <div className="text-xl font-black">{selectedWorker.history.filter(h => h.status === 'verified').length}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Verified Days</div>
                    </div>
                    <div className="bg-brand-ink text-white p-6 rounded-3xl col-span-2 md:col-span-1">
                      <TrendingUp className="text-orange-500 mb-4" size={20} />
                      <div className="text-xl font-black">94%</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/50">Stability Rating</div>
                    </div>
                  </div>

                  {/* Graphical Analysis */}
                  <div className="bg-white p-8 rounded-[2rem] border border-brand-ink/5">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Activity size={16} className="text-orange-500" />
                      Productivity Trend
                    </h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={prepareChartData(selectedWorker.history)}>
                          <defs>
                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                          <YAxis hide />
                          <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 'bold' }} />
                          <Area type="monotone" dataKey="hours" stroke="#FF6B35" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Work History Table */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <Briefcase size={16} className="text-brand-muted" />
                      Detailed Ledger
                    </h3>
                    <div className="space-y-3">
                      {selectedWorker.history.slice(0, 5).map((entry, idx) => (
                        <div key={entry.id || idx} className="flex items-center justify-between p-5 bg-white rounded-3xl border border-brand-ink/5">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-brand-paper rounded-2xl text-brand-ink">
                              <Calendar size={18} />
                            </div>
                            <div>
                              <div className="font-bold text-brand-ink">{new Date(entry.date).toLocaleDateString()}</div>
                              <div className="text-[10px] font-black uppercase tracking-widest text-brand-muted">{entry.workType}</div>
                            </div>
                          </div>
                          <div className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                            entry.status === 'verified' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                          )}>
                            {entry.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-ink/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
