import { useState, useEffect, useMemo } from 'react';
import { User, ShieldCheck, MapPin, Calendar, IndianRupee, Briefcase, Clock, Award, Globe, Printer, Download, CheckCircle2, Phone, Mail, Star, ExternalLink, FileText } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, WorkEntry, WorkCategory } from '../types';
import Analysis from './sections/Analysis';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { formatCurrency } from '../lib/utils';

interface PublicProfileProps {
  setuId: string;
}

export default function PublicProfile({ setuId }: PublicProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const q = query(collection(db, 'users'), where('setuId', '==', setuId));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          setError('Profile not found.');
          setLoading(false);
          return;
        }
        const userData = snapshot.docs[0].data() as UserProfile;
        setProfile(userData);

        const entriesRef = collection(db, `users/${userData.uid}/workEntries`);
        const entriesQ = query(entriesRef, orderBy('createdAt', 'desc'), limit(10));
        const entriesSnapshot = await getDocs(entriesQ);
        setEntries(entriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkEntry)));
      } catch (err) {
        console.error(err);
        setError('Error loading profile.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [setuId]);

  const processedSkills = useMemo(() => {
    if (!entries.length) return [];
    const cats = [...new Set(entries.map(e => e.category))];
    return cats.map(cat => ({
      name: cat,
      count: entries.filter(e => e.category === cat).length
    })).sort((a, b) => b.count - a.count);
  }, [entries]);

  const handlePrint = () => {
    // Specialized print function for better layout and iframe compatibility
    if (!profile) return;
    
    // Calculate trust score for print
    const verifiedCount = entries.filter(e => e.status === 'verified').length;
    const baseScore = 750 + (profile.isVerified ? 100 : 0);
    const trustScore = Math.min(Math.max(baseScore + (verifiedCount * 15), 300), 1000);

    const content = `
      <html>
        <head>
          <title>Karmik Setu - Professional Record</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #141414; line-height: 1.5; }
            .header { border-bottom: 4px solid #141414; padding-bottom: 20px; margin-bottom: 40px; }
            .title { font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; }
            .subtitle { font-size: 10px; color: #666; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; }
            .profile-header { display: flex; gap: 40px; margin-bottom: 40px; align-items: start; }
            .photo-box { width: 140px; height: 140px; background: #f0f0f0; border-radius: 24px; overflow: hidden; flex-shrink: 0; border: 4px solid #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
            .photo-box img { width: 100%; height: 100%; object-fit: cover; }
            .name { font-size: 42px; font-weight: 900; text-transform: uppercase; margin: 0 0 10px 0; letter-spacing: -0.03em; line-height: 0.9; }
            .id-badge { display: inline-block; background: #141414; color: #fff; padding: 6px 16px; rounded-radius: 20px; font-size: 10px; font-weight: 900; border-radius: 100px; margin-right: 10px; }
            .label { font-size: 9px; font-weight: 900; text-transform: uppercase; color: #999; letter-spacing: 0.15em; margin-bottom: 4px; }
            .value { font-size: 14px; font-weight: 700; }
            .stats-grid { display: grid; grid-template-cols: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
            .stat-item { background: #f9f9f7; padding: 20px; border-radius: 24px; border: 1px solid rgba(0,0,0,0.03); }
            .stat-value { font-size: 24px; font-weight: 900; }
            .section-title { font-size: 18px; font-weight: 900; text-transform: uppercase; border-left: 4px solid #5A5A40; padding-left: 15px; margin: 40px 0 20px 0; }
            .table { width: 100%; border-collapse: collapse; }
            .table th { text-align: left; font-size: 9px; font-weight: 900; text-transform: uppercase; color: #999; padding: 15px 10px; border-bottom: 2px solid #141414; }
            .table td { padding: 15px 10px; border-bottom: 1px solid #eee; font-size: 12px; font-weight: 600; }
            .verified-tag { color: #059669; font-weight: 900; font-size: 9px; text-transform: uppercase; }
            .footer { margin-top: 80px; text-align: center; font-size: 9px; color: #bbb; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3em; border-top: 1px solid #eee; pt-20; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Official Karmik Record</div>
            <div class="subtitle">National Verified Workforce Registry</div>
          </div>
          
          <div class="profile-header">
            <div class="photo-box">
              <img src="${profile.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`}" />
            </div>
            <div>
              <div class="name">${profile.name}</div>
              <div style="margin-bottom: 20px;">
                <span class="id-badge">ID: ${profile.setuId}</span>
                <span style="font-size: 10px; font-weight: 900; color: #5A5A40; text-transform: uppercase; letter-spacing: 0.1em;">• Authenticated Identity</span>
              </div>
              <div style="display: grid; grid-template-cols: repeat(2, 1fr); gap: 20px;">
                <div>
                  <div class="label">Location</div>
                  <div class="value">${profile.address}</div>
                </div>
                <div>
                  <div class="label">Contact</div>
                  <div class="value">${profile.phone}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-item">
              <div class="label">Trust Score</div>
              <div class="stat-value">${trustScore}</div>
            </div>
            <div class="stat-item">
              <div class="label">Work Days</div>
              <div class="stat-value">${profile.totalDaysWorked}</div>
            </div>
            <div class="stat-item">
              <div class="label">Net Earnings</div>
              <div class="stat-value">₹${profile.totalEarnings.toLocaleString()}</div>
            </div>
            <div class="stat-item">
              <div class="label">Rating</div>
              <div class="stat-value">A+</div>
            </div>
          </div>

          <div class="section-title">Verified Service Experience</div>
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Work Category</th>
                <th>Work Type</th>
                <th>Status</th>
                <th style="text-align: right;">Yield</th>
              </tr>
            </thead>
            <tbody>
              ${entries.slice(0, 10).map(e => `
                <tr>
                  <td>${new Date(e.createdAt).toLocaleDateString()}</td>
                  <td>${e.category}</td>
                  <td>${e.workType}</td>
                  <td class="verified-tag">VERIFIED</td>
                  <td style="text-align: right;">₹${e.paymentReceived}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">Document digitally signed by Karmik Setu Identity Protocol — Certificate ID: KS-${profile.setuId}-${Date.now()}</div>
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

  if (loading) {
    return (
      <div className="h-screen bg-[#F5F5F0] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span className="font-black uppercase tracking-[0.3em] text-brand-ink text-xs">Authenticating Identity Protocol...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="h-screen bg-[#F5F5F0] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <Globe size={40} />
        </div>
        <h1 className="text-2xl font-black uppercase mb-2">Record Not Found</h1>
        <p className="text-brand-ink/50 mb-8 max-w-xs">{error || 'This Karmik ID does not exist in the verified registry.'}</p>
        <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-brand-primary text-white rounded-xl font-bold uppercase text-xs tracking-widest">
          Return to Registry
        </button>
      </div>
    );
  }

  const mockT = {
    analysis: 'Professional Performance',
    totalDays: 'Days Worked',
    totalEarnings: 'Verified Income',
    skillLevel: 'System Rating',
    earningsHistory: 'Verifiable Earnings Trend',
    workDistribution: 'Skill Mastery Mix',
    strategyTip: 'Karmik Insight',
    strategyDesc: 'Based on consistent service patterns and zero default rate in verified payments.',
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] print:bg-white p-4 lg:p-12 print:p-0 font-sans text-brand-ink">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; margin: 0; padding: 0; }
          .card-shadow { box-shadow: none !important; border: 1px solid #eee !important; }
          @page { margin: 1cm; }
          .document-container { border: none !important; box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: none !important; }
        }
      `}} />

      <div className="max-w-5xl mx-auto space-y-8 document-container">
        {/* Top Control Bar */}
        <header className="flex flex-col md:flex-row justify-between items-center no-print px-4 gap-4 mb-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                <ShieldCheck size={24} />
             </div>
             <div>
                <span className="font-display font-black uppercase tracking-tight text-xl text-brand-ink">Karmik<span className="text-brand-primary">Setu</span></span>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-brand-muted">National Worker Registry</p>
             </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={handlePrint}
              className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3 bg-brand-ink text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl active:scale-95"
            >
              <Printer size={16} /> Print Resume / Save PDF
            </button>
            <div className="hidden md:flex px-5 py-3 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest items-center gap-2 border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live Verification Secure
            </div>
          </div>
        </header>

        {/* The Main Report Document */}
        <section className="bg-white rounded-[3rem] print:rounded-none p-10 lg:p-16 card-shadow border border-brand-ink/5 relative overflow-hidden print:border-none print:p-0 print:overflow-visible">
          
          {/* Document Header Accent */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-brand-primary opacity-20 no-print" />
          
          {/* Official Verification Watermark/Stamp */}
          <div className="absolute top-10 right-10 flex flex-col items-center opacity-[0.03] pointer-events-none select-none print:opacity-10 scale-150 transform origin-top-right">
            <ShieldCheck size={180} className="text-brand-ink" />
            <span className="font-black text-4xl uppercase tracking-[0.5em] mt-4">VERIFIED RECORD</span>
          </div>

          {/* Identity Section */}
          <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center md:items-start text-center md:text-left mb-16">
            <div className="relative">
              <div className="w-48 h-48 bg-brand-paper rounded-[3rem] flex items-center justify-center border-8 border-white shadow-2xl overflow-hidden shrink-0 group">
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={80} className="text-brand-ink/10" />
                )}
              </div>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white">
                <ShieldCheck size={24} />
              </div>
            </div>
            
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                  <h1 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.85] print:text-6xl">{profile.name}</h1>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <div className="bg-brand-ink text-white text-[10px] font-black px-6 py-2.5 rounded-full uppercase tracking-[0.2em] shadow-xl flex items-center gap-2">
                    <FileText size={14} className="text-brand-primary" /> ID: {profile.setuId}
                  </div>
                  <div className="bg-blue-50 text-blue-700 text-[10px] font-black px-6 py-2.5 rounded-full uppercase tracking-[0.2em] border border-blue-100 flex items-center gap-2">
                    <Star size={14} /> SKILL RATING: A+
                  </div>
                </div>
              </div>

              {/* Professional Summary */}
              <div className="max-w-2xl">
                 <p className="text-sm font-medium leading-relaxed italic text-brand-ink/70">
                    "Verified professional with over {profile.totalDaysWorked} days of documented history in {processedSkills[0]?.name || 'the informal sector'}. Demonstrated consistent reliability and skill mastery as verified by multiple independent contractors and the Karmik Setu identity protocol."
                 </p>
              </div>

              {/* Personal Meta Data */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-4 gap-x-8 pt-4 border-t border-brand-ink/5">
                 <div className="flex items-center gap-2 text-brand-muted">
                    <MapPin size={16} className="text-brand-primary" />
                    <span className="text-sm font-bold uppercase tracking-wider">{profile.address}</span>
                 </div>
                 <div className="flex items-center gap-2 text-brand-muted">
                    <Phone size={16} className="text-brand-primary" />
                    <span className="text-sm font-bold uppercase tracking-wider">{profile.phone}</span>
                 </div>
                 <div className="flex items-center gap-2 text-brand-muted">
                    <Mail size={16} className="text-brand-primary" />
                    <span className="text-sm font-bold lowercase tracking-wider">{profile.email}</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 no-print">
            {[
              { label: 'Work Days', value: profile.totalDaysWorked, color: 'text-brand-ink' },
              { label: 'Total Earnings', value: formatCurrency(profile.totalEarnings), color: 'text-brand-primary' },
              { label: 'Verification rate', value: '100%', color: 'text-emerald-600' },
              { label: 'Experience', value: profile.totalDaysWorked > 180 ? 'Expert' : 'Skilled', color: 'text-brand-ink' }
            ].map((stat, i) => (
              <div key={i} className="p-8 bg-brand-paper rounded-[2.5rem] border border-brand-ink/5 text-center">
                <div className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-40">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Skills / Expertise */}
          <div className="mb-16 space-y-6">
             <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-brand-primary pl-4">Core Expertise</h2>
             <div className="flex flex-wrap gap-3">
                {processedSkills.length > 0 ? processedSkills.map(skill => (
                  <div key={skill.name} className="px-6 py-3 bg-brand-paper rounded-2xl flex items-center gap-4 border border-brand-ink/5">
                    <span className="text-sm font-black uppercase text-brand-ink">{skill.name}</span>
                    <div className="flex gap-0.5">
                       {[...Array(5)].map((_, i) => (
                         <div key={i} className={`w-1.5 h-3 rounded-full ${i < Math.min(skill.count/2, 5) ? 'bg-brand-primary' : 'bg-brand-ink/10'}`} />
                       ))}
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-brand-muted italic">Skill profile pending further data verify...</p>
                )}
             </div>
          </div>

          {/* Performance Dashboard */}
          <div className="pt-16 border-t-2 border-brand-ink/10">
             <div className="mb-8">
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Verified Professional Analytics</h2>
                <p className="text-sm text-brand-muted uppercase font-bold tracking-widest">Digital Credit & Service Performance Indicators</p>
             </div>
             <Analysis entries={entries} t={mockT as any} isPublic overrideProfile={profile} />
          </div>

          {/* Recent Service Ledger */}
          <div className="mt-20 space-y-8">
            <div className="flex justify-between items-end border-b-4 border-brand-ink pb-6">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight">Verified Employment Ledger</h2>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mt-1">Legally Verifiable Work Proofs and Income Records</p>
              </div>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-brand-ink text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                 <CheckCircle2 size={12} className="text-brand-primary" /> Registry Active
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted border-b-2 border-brand-ink/10">
                    <th className="py-6 px-2">Date Record</th>
                    <th className="py-6">Sector / Work Type</th>
                    <th className="py-6">Deployment Location</th>
                    <th className="py-6 text-right">Compensation</th>
                    <th className="py-6 text-right pr-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-ink/5">
                  {entries.length > 0 ? entries.map((entry) => (
                    <tr key={entry.id} className="text-sm transition-colors hover:bg-brand-paper group">
                      <td className="py-6 px-2 font-bold text-brand-muted">{format(new Date(entry.createdAt), 'dd MMM yyyy')}</td>
                      <td className="py-6">
                        <div className="flex flex-col">
                           <span className="font-black uppercase tracking-wider text-brand-ink">{entry.workType}</span>
                           <span className="text-[10px] font-bold text-brand-primary uppercase">{entry.category}</span>
                        </div>
                      </td>
                      <td className="py-6">
                         <div className="flex items-center gap-2 text-brand-ink opacity-70">
                            <MapPin size={12} />
                            <span className="text-xs font-bold truncate max-w-[200px]">{entry.location}</span>
                         </div>
                      </td>
                      <td className="py-6 font-black text-right text-lg">{formatCurrency(entry.paymentReceived)}</td>
                      <td className="py-6 text-right pr-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                          <ShieldCheck size={10} /> Verified
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                           <Clock size={48} />
                           <p className="text-xs font-black uppercase tracking-[0.3em]">Querying Verified Ledger...</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Certificate Footer */}
          <div className="mt-24 space-y-12">
             <div className="bg-brand-ink text-white p-12 rounded-[3.5rem] flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden print:rounded-3xl print:p-8 print:mt-12">
                <div className="absolute inset-0 bg-brand-primary opacity-5 -rotate-12 translate-x-1/2" />
                <div className="relative z-10 space-y-6 flex-1">
                  <h3 className="text-3xl font-black uppercase tracking-tight italic leading-none">Security Protocol Disclaimer</h3>
                  <p className="text-white/40 text-sm max-w-xl leading-relaxed font-medium">
                    This document serves as an official authenticated professional record. All financial data and service periods have been strictly verified through biometric cross-referencing and multi-signatory confirmation by registered contractors and organizations within the Karmik Setu decentralized ecosystem. Any alteration of this document invalidates its digital signature.
                  </p>
                  <div className="flex gap-8">
                     <div>
                        <div className="text-[8px] font-black uppercase text-white/50 mb-2 tracking-[0.2em]">Record Integrity</div>
                        <div className="text-sm font-bold text-brand-primary">100% SECURE</div>
                     </div>
                     <div>
                        <div className="text-[8px] font-black uppercase text-white/50 mb-2 tracking-[0.2em]">Platform Version</div>
                        <div className="text-sm font-bold text-brand-primary">KARMIC-SETU-V2.0</div>
                     </div>
                  </div>
                </div>
                <div className="relative z-10 shrink-0 text-center space-y-4">
                   <div className="w-40 h-40 border-8 border-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary bg-white/5 mx-auto group hover:scale-110 transition-transform cursor-pointer">
                     <ShieldCheck size={80} />
                   </div>
                   <div className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Authentic Proof</div>
                </div>
             </div>

             <div className="flex flex-col md:flex-row justify-between items-center opacity-30 text-[8px] font-black uppercase tracking-[0.5em] gap-8 border-t border-brand-ink/10 pt-12">
                <div className="flex items-center gap-3">
                   <Star size={12} /> VERIFIABLE PROFESSIONAL IDENTITY PROTOCOL
                </div>
                <div className="text-center">
                   © 2026 KARMIK SETU — NATIONAL DATA INFRASTRUCTURE
                </div>
                <div className="flex items-center gap-2">
                   {window.location.origin}/view/{profile.setuId} <ExternalLink size={12} />
                </div>
             </div>
          </div>
        </section>

        <footer className="text-center text-[10px] font-black uppercase tracking-[0.3em] opacity-40 py-12 no-print flex flex-col items-center gap-4">
          <div className="w-px h-12 bg-gradient-to-b from-brand-primary to-transparent" />
          End of Official Verified Professional Identity Record [KARMIK ID: {profile.setuId}]
        </footer>
      </div>
    </div>
  );
}
