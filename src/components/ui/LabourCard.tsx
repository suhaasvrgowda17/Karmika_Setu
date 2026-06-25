import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { ShieldCheck, CheckCircle2, MapPin, Calendar, Smartphone, User, History, PenTool as Tool, FileText } from 'lucide-react';
import { UserProfile, WorkEntry } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';

interface LabourCardProps {
  profile: UserProfile;
  workEntries: WorkEntry[];
  t: any;
}

export default function LabourCard({ profile, workEntries, t }: LabourCardProps) {
  const today = new Date().toLocaleDateString('en-IN');
  
  // Sample renewal data
  const renewals = [
    { no: 1, date: '12/05/2024', validity: '11/05/2025', signature: 'Signed' },
    { no: 2, date: '14/05/2025', validity: '13/05/2026', signature: 'Signed' },
  ];

  // Sample work history for the card
  const displayEntries = workEntries.slice(0, 5);
  while (displayEntries.length < 5) {
    displayEntries.push({
      id: `placeholder-${displayEntries.length}`,
      userId: profile.uid,
      date: '---',
      category: '---' as any,
      workType: '---',
      location: '---',
      hoursWorked: 0,
      paymentReceived: 0,
      paymentStatus: 'Paid',
      createdAt: Date.now()
    });
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 bg-brand-paper min-h-screen items-center">
      <div className="w-full max-w-4xl space-y-12">
        
        {/* FRONT SIDE */}
        <div className="relative bg-[#f4f1ea] border-2 border-[#5A5A40]/30 shadow-2xl rounded-sm p-6 overflow-hidden paper-texture">
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-brand-primary/20 pb-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/800px-Emblem_of_India.svg.png" 
                  alt="Emblem of India" 
                  className="h-14 grayscale brightness-50 contrast-125"
                />
              </div>
              <div className="font-display">
                <h2 className="text-xl font-bold text-brand-primary uppercase leading-tight">Labour Department</h2>
                <h3 className="text-sm font-semibold text-brand-primary/80 uppercase">Government of India / भारत सरकार</h3>
                <h1 className="text-2xl font-black text-brand-ink/90 mt-1 uppercase tracking-wider">Labour Card / श्रमिक कार्ड</h1>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
               <div className="w-28 h-32 bg-white border-2 border-brand-primary/20 shadow-sm overflow-hidden flex items-center justify-center">
                 {profile.photoUrl ? (
                   <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover grayscale contrast-125" referrerPolicy="no-referrer" />
                 ) : (
                   <User size={48} className="text-brand-ink/20" />
                 )}
               </div>
               <span className="text-[8px] font-bold uppercase mt-1 opacity-40">Photo of Worker</span>
            </div>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="bg-white/50 border border-brand-primary/10 p-3 rounded-sm">
                <label className="text-[9px] font-black uppercase tracking-widest text-brand-muted block mb-1">Labour Card Number / कार्ड संख्या</label>
                <span className="text-xl font-black font-mono text-brand-ink">{profile.setuId}</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <DetailField label="Full Name / नाम" value={profile.name} />
                <DetailField label="Father/Husband Name / पिता/पति का नाम" value="Late Shri R.K. Sharma" />
                <div className="grid grid-cols-2 gap-4">
                  <DetailField label="D.O.B / जन्म तिथि" value="15-08-1985" />
                  <DetailField label="Gender / लिंग" value="Male / पुरुष" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
               <DetailArea label="Address / पता" value={profile.address || 'Address not registered'} />
               
               <div className="mt-6 flex flex-col items-end">
                 <div className="relative">
                   <div className="absolute -top-12 -left-8 pointer-events-none opacity-40">
                     <img 
                       src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Signature_of_R._K._Narayan.svg" 
                       className="h-16 grayscale brightness-0" 
                       alt="Signature"
                     />
                   </div>
                   <div className="w-40 h-1 bg-brand-ink/20 mt-4"></div>
                   <span className="text-[8px] font-black uppercase text-center w-full block mt-1 tracking-widest">Issuing Authority Signature</span>
                 </div>
                 
                 <div className="mt-4 mr-8 opacity-20">
                    <div className="w-16 h-16 rounded-full border-4 border-red-900 flex items-center justify-center -rotate-12">
                      <span className="text-red-900 font-black text-[10px] text-center leading-none uppercase">Verified<br/>Labour<br/>Dept</span>
                    </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex justify-between items-end border-t border-brand-primary/10 pt-4 mt-2">
            <div>
              <span className="text-[10px] font-bold text-brand-muted opacity-60">Registration ID: {profile.uid.substring(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-700" size={16} />
              <span className="text-[10px] font-black uppercase text-emerald-800 tracking-tighter italic">Electronically Authenticated Record</span>
            </div>
          </div>
        </div>

        {/* INSIDE PAGES (RENEWAL & DETAILS) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* RENEWAL SECTION (Top Right Page) */}
          <div className="bg-[#f4f1ea] border-2 border-[#5A5A40]/30 shadow-xl rounded-sm p-6 paper-texture flex flex-col">
            <h3 className="font-display font-bold text-lg mb-4 border-b border-brand-primary/20 pb-2 uppercase tracking-wide">Renewal Section / नवीनीकरण अनुभाग</h3>
            
            <div className="flex-1 overflow-hidden border border-brand-primary/20">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-brand-primary/5">
                  <tr>
                    <th className="border-r border-b border-brand-primary/20 p-2 font-black uppercase text-[9px]">S.No.</th>
                    <th className="border-r border-b border-brand-primary/20 p-2 font-black uppercase text-[9px]">Renewal Date</th>
                    <th className="border-r border-b border-brand-primary/20 p-2 font-black uppercase text-[9px]">Validity Period</th>
                    <th className="border-b border-brand-primary/20 p-2 font-black uppercase text-[9px]">Signature</th>
                  </tr>
                </thead>
                <tbody>
                  {renewals.map((r) => (
                    <tr key={r.no} className="border-b border-brand-primary/10">
                      <td className="border-r border-brand-primary/20 p-2 font-bold">{r.no}</td>
                      <td className="border-r border-brand-primary/20 p-2 font-medium">{r.date}</td>
                      <td className="border-r border-brand-primary/20 p-2 font-medium">{r.validity}</td>
                      <td className="p-2 relative">
                        <span className="text-[10px] font-display italic opacity-60">{r.signature}</span>
                        {r.no === 2 && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                            <div className="w-8 h-8 rounded-full border-2 border-red-800 flex items-center justify-center rotate-45 text-[6px] font-black text-red-800 text-center uppercase">
                              PAID
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {[3, 4, 5, 6].map((i) => (
                    <tr key={i} className="border-b border-brand-primary/10 h-10">
                      <td className="border-r border-brand-primary/20 p-2 font-bold">{i}</td>
                      <td className="border-r border-brand-primary/20 p-2"></td>
                      <td className="border-r border-brand-primary/20 p-2"></td>
                      <td className="p-2"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-2 py-2 bg-white/40 border border-dashed border-brand-primary/20 border-rounded">
              <CheckCircle2 size={14} className="text-brand-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Digitally Signed & Validated</span>
            </div>
          </div>

          {/* WORKER DETAILS PAGE (Bottom Left) */}
          <div className="bg-[#f4f1ea] border-2 border-[#5A5A40]/30 shadow-xl rounded-sm p-6 paper-texture">
            <h3 className="font-display font-bold text-lg mb-4 border-b border-brand-primary/20 pb-2 uppercase tracking-wide">Worker Details / श्रमिक का विवरण</h3>
            
            <div className="grid grid-cols-1 border border-brand-primary/20 text-xs">
              <GridRow label="Labour Card Number" value={profile.setuId} />
              <GridRow label="Name of Worker" value={profile.name} />
              <GridRow label="Father/Husband Name" value="Late Shri R.K. Sharma" />
              <GridRow label="Date of Birth" value="15-08-1985" />
              <GridRow label="Gender" value="Male" />
              <GridRow label="Occupation" value="Mason / राजमिस्त्री" />
              <GridRow label="Mobile Number" value={profile.phone} />
              <GridRow label="Address" value={profile.address} />
              <GridRow label="Registration Date" value="10-05-2024" />
            </div>
            
            <div className="mt-8 flex justify-between items-end">
              <div className="p-3 bg-white border-2 border-brand-primary/10 rounded-sm">
                <QRCodeCanvas 
                  value={`${window.location.origin}/view/${profile.setuId}`} 
                  size={80}
                  level="H"
                  includeMargin={false}
                  fgColor="#141414"
                />
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                  <ShieldCheck size={12} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Verified Record</span>
                </div>
                <p className="text-[8px] font-bold opacity-40 uppercase">This is a system-generated record.<br/>No manual signature required.</p>
              </div>
            </div>
          </div>
        </div>

        {/* WORK HISTORY PAGE (Bottom Right) */}
        <div className="bg-[#f4f1ea] border-2 border-[#5A5A40]/30 shadow-xl rounded-sm p-8 paper-texture">
          <div className="flex justify-between items-center mb-6 border-b-2 border-brand-primary/20 pb-4">
             <div className="flex items-center gap-4">
               <History className="text-brand-primary" size={28} />
               <h3 className="font-display font-black text-2xl uppercase tracking-tighter">Verified Work History / कार्य विवरण</h3>
             </div>
             <div className="text-right">
               <span className="text-[10px] font-black uppercase text-brand-muted tracking-widest block">Total Working Days</span>
               <span className="text-2xl font-black text-brand-ink">{profile.totalDaysWorked} Days</span>
             </div>
          </div>
          
          <div className="overflow-x-auto border border-brand-primary/20">
            <table className="w-full text-left text-[10px] border-collapse min-w-[800px]">
              <thead className="bg-brand-primary/5">
                <tr>
                  <th className="border-r border-b border-brand-primary/20 p-2 font-black uppercase">S.No.</th>
                  <th className="border-r border-b border-brand-primary/20 p-2 font-black uppercase">Date of Work</th>
                  <th className="border-r border-b border-brand-primary/20 p-2 font-black uppercase">Nature of Work</th>
                  <th className="border-r border-b border-brand-primary/20 p-2 font-black uppercase">Place of Work</th>
                  <th className="border-r border-b border-brand-primary/20 p-2 font-black uppercase">No. of Days</th>
                  <th className="border-r border-b border-brand-primary/20 p-2 font-black uppercase">Wage Rate</th>
                  <th className="border-r border-b border-brand-primary/20 p-2 font-black uppercase">Payment</th>
                  <th className="border-b border-brand-primary/20 p-2 font-black uppercase">Signature / Seal</th>
                </tr>
              </thead>
              <tbody>
                {displayEntries.map((e, idx) => (
                  <tr key={e.id} className="border-b border-brand-primary/10 bg-white/20">
                    <td className="border-r border-brand-primary/20 p-3 font-bold">{idx + 1}</td>
                    <td className="border-r border-brand-primary/20 p-3 font-medium">{e.date}</td>
                    <td className="border-r border-brand-primary/20 p-3 font-bold text-brand-ink/80">{e.workType}</td>
                    <td className="border-r border-brand-primary/20 p-3 italic">{e.location}</td>
                    <td className="border-r border-brand-primary/20 p-3 font-bold text-center">1</td>
                    <td className="border-r border-brand-primary/20 p-3 font-medium">₹{e.paymentReceived}</td>
                    <td className="border-r border-brand-primary/20 p-3 font-black text-emerald-900">{formatCurrency(e.paymentReceived)}</td>
                    <td className="p-3 relative">
                      {e.status === 'verified' && (
                        <div className="flex items-center gap-1 text-emerald-700 font-bold uppercase text-[8px]">
                          <CheckCircle2 size={10} /> {e.contractorName || 'Verified'}
                        </div>
                      )}
                      {e.id.includes('placeholder') && <span className="opacity-0">---</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 flex justify-between items-start opacity-70">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white border border-brand-primary/10 rounded-sm italic font-display text-xs">
                \"Karmik Setu ensures every hour of labour is recognized and recorded.\"\n- Digital Mission
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary flex items-center justify-end gap-2">
                <FileText size={14} /> Digitally Generated Document
              </p>
              <p className="text-[9px] font-bold text-brand-muted uppercase">Printed Date: {today}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Instructions / Notice */}
      <div className="w-full max-w-4xl bg-white p-6 rounded-3xl border border-brand-ink/5 card-shadow no-print">
        <h4 className="flex items-center gap-2 font-bold mb-4">
          <Tool className="text-brand-primary" size={20} />
          Digital Management Notice
        </h4>
        <ul className="text-xs text-brand-muted space-y-2 list-disc pl-5 leading-relaxed">
          <li>This labour card is a verifiable digital duplicate of the worker\'s professional identity.</li>
          <li>Scan the QR code to verify live employment status and trust score.</li>
          <li>For any discrepancies, contact government support through the Help section.</li>
          <li>Report loss of physical copy immediately via the Settings menu.</li>
        </ul>
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-brand-primary/10 pb-1">
      <label className="text-[8px] font-black uppercase tracking-widest text-brand-muted opacity-60 block">{label}</label>
      <span className="text-xs font-bold text-brand-ink uppercase">{value}</span>
    </div>
  );
}

function DetailArea({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-brand-primary/5 p-3 rounded-sm border-l-4 border-brand-primary">
      <label className="text-[8px] font-black uppercase tracking-widest text-brand-muted opacity-60 block mb-1">{label}</label>
      <p className="text-xs font-bold text-brand-ink leading-relaxed uppercase">{value}</p>
    </div>
  );
}

function GridRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b border-brand-primary/20">
      <div className="w-1/2 bg-brand-primary/5 p-2 font-black uppercase text-[9px] border-r border-brand-primary/20">
        {label}
      </div>
      <div className="w-1/2 p-2 font-bold uppercase">
        {value}
      </div>
    </div>
  );
}
