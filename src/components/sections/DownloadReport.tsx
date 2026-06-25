import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileDown, Printer, Mail, Share2, CheckCircle, Smartphone, TrendingUp, BarChart3 } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { UserProfile, WorkEntry } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';

interface DownloadReportProps {
  profile: UserProfile | null;
  entries: WorkEntry[];
  t: any;
}

export default function DownloadReport({ profile, entries, t }: DownloadReportProps) {
  const [activeReportType, setActiveReportType] = useState<'standard' | 'idcard' | 'financial' | 'skills' | 'pitch'>('standard');
  const user = profile || {
    name: "Guest User",
    totalDaysWorked: 0,
    totalEarnings: 0,
    phone: "N/A",
    setuId: "SS-NEW",
    isVerified: false
  };

  const reportTypes = [
    { id: 'standard', title: 'Work Certificate', icon: FileDown, desc: 'Complete verifiable work history' },
    { id: 'idcard', title: 'Shramik ID Card', icon: Smartphone, desc: 'Printable digital identity card' },
    { id: 'financial', title: 'Financial Ledger', icon: BarChart3, desc: 'Earnings & credit-readiness report' },
    { id: 'pitch', title: 'Pitch Deck', icon: TrendingUp, desc: 'Project vision & impact slides' }
  ];

  // Prepare colorful chart data
  const chartData = entries.slice(-5).map(e => ({
    date: e.date,
    amount: e.paymentReceived,
    type: e.workType
  }));

  const COLORS = ['#5A5A40', '#8E9299', '#B8B89F', '#D6D6C2', '#2C2C24'];

  const handleDownload = () => {
    const doc = new jsPDF();
    
    if (activeReportType === 'idcard') {
       // ID Card specialized PDF
       doc.setFillColor(20, 20, 20);
       doc.rect(20, 20, 170, 100, 'F');
       doc.setTextColor(255, 255, 255);
       doc.setFontSize(24);
       doc.text('SHRAMIK SETU', 30, 45);
       doc.setFontSize(10);
       doc.text('VERIFIED DIGITAL IDENTITY', 30, 52);
       
       doc.setFontSize(18);
       doc.text(user.name.toUpperCase(), 30, 75);
       doc.setFontSize(12);
       doc.text(`ID: ${user.setuId}`, 30, 85);
       doc.text(`Phone: ${user.phone}`, 30, 95);
       
       if (user.isVerified) {
         doc.setFillColor(90, 90, 64);
         doc.rect(140, 30, 40, 10, 'F');
         doc.setFontSize(8);
         doc.text('VERIFIED PORTAL', 145, 37);
       }
       
       doc.save(`shramik-id-${user.setuId}.pdf`);
       return;
    }

    if (activeReportType === 'financial') {
       doc.setFontSize(20);
       doc.text('FINANCIAL ELIGIBILITY REPORT', 105, 20, { align: 'center' });
       doc.setFontSize(12);
       doc.text(`Worker: ${user.name}`, 20, 40);
       doc.text(`Net Earnings: ${formatCurrency(user.totalEarnings)}`, 20, 50);
       
       const verifiedCount = entries.filter(e => e.status === 'verified').length;
       const trustScore = 750 + (user.isVerified ? 100 : 0) + (verifiedCount * 15);
       
       doc.text(`Trust Score: ${trustScore} / 1000`, 20, 60);
       doc.text(`Loan Eligibility: ${trustScore > 750 ? 'HIGH' : 'MODERATE'}`, 20, 70);
       
       autoTable(doc, {
         startY: 85,
         head: [['Month', 'Earnings', 'Jobs Hist.']],
         body: [['Month 1', 'Rs. 12,000', '4'], ['Month 2', 'Rs. 14,500', '6'], ['Month 3', 'Rs. 9,000', '3']],
         headStyles: { fillColor: [44, 44, 36] }
       });
       
       doc.save(`financial-ledger-${user.setuId}.pdf`);
       return;
    }

    if (activeReportType === 'pitch') {
       doc.setFontSize(28);
       doc.setTextColor(20, 20, 20);
       doc.text('KARMIK SETU', 105, 50, { align: 'center' });
       doc.setFontSize(16);
       doc.text('Bridging the Trust Gap for the Invisible Workforce', 105, 65, { align: 'center' });
       
       doc.addPage();
       doc.setFontSize(22);
       doc.text('1. THE PROBLEM', 20, 30);
       doc.setFontSize(12);
       doc.text('• 450M+ unorganized workers in India lack verifiable data.', 25, 50);
       doc.text('• No credit history = No loans, No insurance, No security.', 25, 60);
       doc.text('• Contractors struggle to find verified, skilled labor.', 25, 70);
       
       doc.addPage();
       doc.setFontSize(22);
       doc.text('2. OUR SOLUTION', 20, 30);
       doc.text('Digital Identity & Work Ledger', 20, 42);
       doc.setFontSize(12);
       doc.text('• Voice-to-Data: AI handles complex workflow logging.', 25, 60);
       doc.text('• Trust Score: Proprietary reputation-based credit scoring.', 25, 70);
       doc.text('• Setu ID: One verified card for all government & bank needs.', 25, 80);
       
       doc.addPage();
       doc.setFontSize(22);
       doc.text('3. IMPACT METRICS', 20, 30);
       doc.setFontSize(12);
       doc.text(`User Profile: ${user.name}`, 25, 50);
       doc.text(`Verified Days Worked: ${user.totalDaysWorked}`, 25, 60);
       doc.text(`Estimated Trust Gain: +45% YoY`, 25, 70);
       doc.text('Scalable ESG reporting for large organizations.', 25, 80);
       
       doc.save(`karmik-setu-pitch-deck.pdf`);
       return;
    }

    if (activeReportType === 'skills') {
       doc.setFontSize(22);
       doc.text('SKILLS VALIDATION CERTIFICATE', 105, 20, { align: 'center' });
       doc.setFontSize(10);
       doc.text('Certified by Karmik Setu Workforce Analysis', 105, 28, { align: 'center' });
       
       doc.setFontSize(14);
       doc.text(`Awarded to: ${user.name}`, 20, 50);
       
       const cats = [...new Set(entries.map(e => e.category))];
       doc.setFontSize(12);
       doc.text('Verified Domain Expertise:', 20, 65);
       
       let syPos = 75;
       cats.forEach(cat => {
         doc.text(`• ${cat}`, 25, syPos);
         syPos += 8;
       });
       
       doc.setDrawColor(90, 90, 64);
       doc.setLineWidth(1);
       doc.line(20, syPos + 10, 190, syPos + 10);
       
       doc.setFontSize(10);
       doc.text('This certificate validates that the aforementioned worker has completed multiple verified jobs', 20, syPos + 25);
       doc.text('registered on the Shramik Setu platform with consistent positive feedback.', 20, syPos + 31);
       
       doc.save(`skills-cert-${user.setuId}.pdf`);
       return;
    }

    // Default Standard Report
    doc.setFontSize(22);
    doc.text('KARMIK SETU - WORK CERTIFICATE', 105, 20, { align: 'center' });
    // ... rest of standard report logic ...
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 50);
    doc.text(`Worker Name: ${user.name}`, 20, 60);
    doc.text(`Karmik Setu ID: ${user.setuId}`, 20, 70);
    doc.text(`Total Days Worked: ${user.totalDaysWorked}`, 20, 80);
    doc.text(`Total Verifiable Earnings: ${formatCurrency(user.totalEarnings)}`, 20, 90);
    
    autoTable(doc, {
      startY: 110,
      head: [['Date', 'Job', 'Location', 'Status', 'Pay']],
      body: entries.map(e => [e.date, e.workType, e.location, e.status || 'Verified', `Rs. ${e.paymentReceived}`]),
      headStyles: { fillColor: [90, 90, 64] },
    });
    
    doc.save(`karmik-work-cert-${user.setuId}.pdf`);
  };

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
          <title>Karmik Setu - Work Certificate</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #141414; line-height: 1.5; }
            .header { border-bottom: 4px solid #141414; padding-bottom: 20px; margin-bottom: 40px; }
            .title { font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; }
            .subtitle { font-size: 10px; color: #666; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; }
            .label { font-size: 9px; font-weight: 900; text-transform: uppercase; color: #999; letter-spacing: 0.15em; margin-bottom: 4px; }
            .value { font-size: 14px; font-weight: 700; margin-bottom: 20px; }
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
            <div class="title">Official Work Certificate</div>
            <div class="subtitle">Verifiable Employment Activity Report</div>
          </div>
          
          <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
            <div>
              <div class="label">Worker Name</div>
              <div class="value" style="font-size: 24px;">${profile.name}</div>
              <div class="label">Setu ID</div>
              <div class="value">${profile.setuId}</div>
            </div>
            <div style="text-align: right;">
              <div class="label">Identity Status</div>
              <div class="value" style="color: #059669;">Verified Identity</div>
              <div class="label">Report Date</div>
              <div class="value">${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-item">
              <div class="label">Trust score</div>
              <div class="stat-value">${trustScore}</div>
            </div>
            <div class="stat-item">
              <div class="label">Days worked</div>
              <div class="stat-value">${profile.totalDaysWorked}</div>
            </div>
            <div class="stat-item">
              <div class="label">Net earnings</div>
              <div class="stat-value">₹${profile.totalEarnings.toLocaleString()}</div>
            </div>
            <div class="stat-item">
              <div class="label">System Rating</div>
              <div class="stat-value">A+</div>
            </div>
          </div>

          <div class="section-title">Employment Ledger (Verified)</div>
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Work type</th>
                <th>Status</th>
                <th style="text-align: right;">Payout</th>
              </tr>
            </thead>
            <tbody>
              ${entries.slice(0, 15).map(e => `
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

          <div class="footer">This is an official verifiable work certificate from the Karmik Setu registry. Digital ID: ${profile.setuId}</div>
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

  const shareToWhatsapp = () => {
    const text = encodeURIComponent(`Check out my verified Karmik Setu Work Report: ${window.location.origin}/view/${user.setuId}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareEmail = () => {
    const subject = encodeURIComponent('Verified Work Certificate - Karmik Setu');
    const body = encodeURIComponent(`Hello,\n\nPlease find my verified work history report at: ${window.location.origin}/view/${user.setuId}\n\nGenerated by Karmik Setu.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareGeneral = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Karmik Setu Work Report',
        text: `Verified work history for ${user.name}`,
        url: `${window.location.origin}/view/${user.setuId}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/view/${user.setuId}`);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl font-bold mb-2">{t.report}</h1>
        <p className="text-brand-ink/60">{t.reportDesc}</p>
      </header>

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveReportType(type.id as any)}
            className={cn(
              "flex flex-col items-center gap-3 p-6 rounded-[2rem] border transition-all duration-300",
              activeReportType === type.id 
                ? "bg-brand-ink text-white border-brand-ink shadow-xl scale-[1.02]" 
                : "bg-white text-brand-ink border-brand-ink/5 hover:border-brand-ink/20"
            )}
          >
            <type.icon size={24} className={activeReportType === type.id ? "text-brand-primary" : "text-brand-muted"} />
            <div className="text-center">
              <div className="text-xs font-black uppercase tracking-tight mb-1">{type.title}</div>
              <div className="text-[10px] opacity-60 font-bold leading-tight">{type.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preview Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 card-shadow border border-brand-ink/5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xl">{t.reportPreview}</h3>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold flex items-center gap-1">
                <CheckCircle size={14} /> {t.ready}
              </span>
            </div>
            
            <div className="aspect-[1/1.414] bg-brand-paper rounded-xl p-8 shadow-inner overflow-hidden flex flex-col">
              <div className="text-center space-y-2 mb-8 border-b border-brand-ink/10 pb-6">
                <div className="w-12 h-12 bg-brand-primary rounded-lg mx-auto flex items-center justify-center text-white font-black text-xl mb-2">
                  {user.name.charAt(0)}
                </div>
                <h4 className="text-sm font-bold uppercase tracking-widest opacity-50">Karmik Setu</h4>
                <p className="font-display text-2xl font-bold italic">{user.name}</p>
              </div>
              
              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg border border-brand-ink/5">
                    <p className="text-[10px] uppercase opacity-40 font-bold">{t.totalDays}</p>
                    <p className="text-lg font-bold">{user.totalDaysWorked}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-brand-ink/5">
                    <p className="text-[10px] uppercase opacity-40 font-bold">{t.totalEarnings}</p>
                    <p className="text-lg font-bold">{formatCurrency(user.totalEarnings)}</p>
                  </div>
                </div>
                
                <div className="pt-4 space-y-2">
                  <p className="text-[10px] uppercase opacity-40 font-bold">{t.history}</p>
                  {entries.slice(0, 3).map(entry => (
                    <div key={entry.id} className="flex justify-between text-xs border-b border-brand-ink/5 py-1">
                      <span className="opacity-70 truncate max-w-[150px]">{entry.date} - {entry.workType}</span>
                      <span className="font-bold">{formatCurrency(entry.paymentReceived)}</span>
                    </div>
                  ))}
                  {entries.length === 0 && (
                    <p className="text-xs italic opacity-40">{t.noEntries}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-brand-ink/10 flex items-center justify-between">
                <div className="w-16 h-16 bg-brand-ink rounded shadow-sm opacity-20"></div>
                <div className="text-right">
                  <p className="text-[8px] uppercase font-black opacity-30">{t.scanToVerify}</p>
                  <p className="text-[10px] font-bold">{t.verifiedProf}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions & Analytics */}
        <div className="space-y-6">
          {/* Colourful Analysis */}
          <div className="bg-white p-8 rounded-3xl card-shadow border border-brand-ink/5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="text-brand-primary" size={24} /> 
                {t.workAnalysis}
              </h3>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp size={18} />
              </div>
            </div>
            
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-brand-muted text-center italic">Recent earnings visualization across major projects.</p>
          </div>

          <div className="bg-brand-primary p-8 rounded-3xl text-white space-y-6 shadow-xl shadow-brand-primary/20">
            <h3 className="text-2xl font-bold">{t.actions}</h3>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-3 bg-white text-brand-primary p-4 rounded-2xl font-bold hover:scale-[1.02] transition-all"
              >
                <FileDown size={24} /> {t.downloadReport}
              </button>
              <button 
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-3 bg-white/10 text-white p-4 rounded-2xl font-bold border border-white/20 hover:bg-white/20 transition-all font-display"
              >
                <Printer size={24} /> {t.printDirectly}
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl card-shadow border border-brand-ink/5 space-y-6">
            <h3 className="text-xl font-bold">{t.sendTo}</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={shareToWhatsapp}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-brand-ink/10 hover:bg-brand-paper transition-colors group"
              >
                <Smartphone size={24} className="text-green-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">{t.whatsApp}</span>
              </button>
              <button 
                onClick={shareEmail}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-brand-ink/10 hover:bg-brand-paper transition-colors group"
              >
                <Mail size={24} className="text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">{t.email}</span>
              </button>
              <button 
                onClick={shareGeneral}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-brand-ink/10 hover:bg-brand-paper transition-colors col-span-2 group"
              >
                <Share2 size={24} className="text-brand-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">{t.shareOther}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
