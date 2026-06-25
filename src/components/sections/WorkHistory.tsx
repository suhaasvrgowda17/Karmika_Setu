import { useState } from 'react';
import { Search, Filter, MapPin, Calendar, IndianRupee, Clock, ChevronRight, FileText, Download, ShieldCheck, User } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { WorkEntry } from '../../types';

interface WorkHistoryProps {
  entries: WorkEntry[];
  t: any;
}

export default function WorkHistory({ entries, t }: WorkHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntries = entries.filter(entry => 
    entry.workType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    if (entries.length === 0) return;
    
    const headers = ['Date', 'Category', 'Work Type', 'Location', 'Contractor', 'Hours', 'Earnings', 'Status'];
    const rows = entries.map(e => [
      e.date,
      e.category,
      e.workType,
      e.location,
      e.contractorName || '',
      e.hoursWorked,
      e.paymentReceived,
      e.paymentStatus
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(r => r.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Karmik_Work_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    // Print strategy for better iframe compatibility
    const content = `
      <html>
        <head>
          <title>Karmik Setu - Work History</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #141414; }
            h1 { border-bottom: 3px solid #5A5A40; padding-bottom: 10px; margin-bottom: 30px; font-weight: 900; }
            .entry { border-bottom: 1px solid #EEE; padding: 20px 0; display: flex; justify-content: space-between; align-items: center; }
            .job { font-weight: 800; font-size: 18px; margin-bottom: 5px; }
            .details { font-size: 14px; color: #666; }
            .amount { font-weight: 900; font-size: 22px; color: #5A5A40; }
            .status { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #5A5A40; opacity: 0.6; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; opacity: 0.5; }
          </style>
        </head>
        <body>
          <h1>KARMIK SETU - OFFICIAL WORK RECORD</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
          ${filteredEntries.map(e => `
            <div class="entry">
              <div style="flex: 1;">
                <div class="job">${e.workType}</div>
                <div class="details">
                  ${e.category} | ${e.date} | ${e.location} | ${e.hoursWorked} Hours
                  ${e.contractorName ? `<br/><b>Contractor:</b> ${e.contractorName}` : ''}
                </div>
              </div>
              <div style="text-align: right;">
                <div class="amount">${formatCurrency(e.paymentReceived)}</div>
                <div class="status">${e.status?.toUpperCase() || 'VERIFIED'}</div>
              </div>
            </div>
          `).join('')}
          <div class="footer">This is an automated verifiable digital record from the Karmik Setu Protocol.</div>
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

  const downloadIndividualEntry = (e: WorkEntry) => {
    const content = `
KARMIK SETU - WORK VERIFICATION RECORD
---------------------------------------
Work Type: ${e.workType}
Category: ${e.category}
Location: ${e.location}
Date: ${e.date}
Contractor: ${e.contractorName || 'N/A'}
Hours Worked: ${e.hoursWorked}
Earnings: ₹${e.paymentReceived}
Status: ${e.paymentStatus}
Verification ID: SS-VER-${e.id.substring(0, 8).toUpperCase()}

Verified by Karmik Setu Digital Infrastructure.
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Work_Entry_${e.date}_${e.id.substring(0, 4)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="print:block">
          <h1 className="font-display text-4xl font-bold mb-2">{t.workHistory}</h1>
          <p className="text-brand-ink/60 print:hidden">{t.historyDesc}</p>
        </div>
        <div className="flex gap-3 print:hidden">
          <button 
            onClick={handlePrint}
            type="button"
            className="flex items-center gap-2 px-6 py-3 bg-white border border-brand-ink/10 text-brand-ink rounded-xl font-bold shadow-sm transition-transform active:scale-95 hover:bg-brand-paper"
          >
            <FileText size={20} /> Print
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-6 py-3 bg-brand-ink text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95"
          >
            <Download size={20} /> {t.exportCsv}
          </button>
        </div>
      </header>

      {/* Filters & Search - Hidden in Print */}
      <div className="flex flex-col md:flex-row gap-4 print:hidden">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30" size={20} />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white pl-12 pr-4 py-4 rounded-2xl border border-brand-ink/5 card-shadow outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
        <button className="px-6 py-4 bg-white rounded-2xl border border-brand-ink/5 card-shadow flex items-center gap-2 font-bold text-brand-ink/60">
          <Filter size={20} /> {t.filters}
        </button>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((item) => (
            <div 
              key={item.id}
              className="bg-white p-6 rounded-3xl border border-brand-ink/5 card-shadow group hover:border-brand-primary/20 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-paper flex items-center justify-center text-brand-primary shrink-0 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                    <FileText size={28} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-lg">{item.workType}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-brand-ink/50">
                      <span className="flex items-center gap-1.5"><MapPin size={14} /> {item.location}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={14} /> {item.date}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} /> {item.hoursWorked} {t.hoursWorked}</span>
                      {item.contractorName && (
                        <span className="flex items-center gap-1.5 font-bold text-brand-primary/60"><User size={14} /> {item.contractorName}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:flex-row md:items-center md:gap-8 gap-2 pr-4">
                  <div className="text-2xl font-black text-brand-primary flex items-center md:mb-0">
                    {formatCurrency(item.paymentReceived)}
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); downloadIndividualEntry(item); }}
                      className="p-2 text-brand-muted hover:text-brand-primary hover:bg-brand-paper rounded-lg transition-all print:hidden"
                      title="Download Work Record"
                    >
                      <Download size={20} />
                    </button>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap",
                      item.status === 'verified' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                      item.status === 'rejected' ? "bg-rose-50 text-rose-600 border border-rose-100" :
                      "bg-amber-50 text-amber-600 border border-amber-100"
                    )}>
                      {item.status === 'verified' ? t.verified : 
                       item.status === 'rejected' ? 'Rejected' : 
                       'Pending Verification'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-brand-ink/10 text-brand-ink/40">
            {t.noRecordsFound} {searchTerm && `for "${searchTerm}"`}
          </div>
        )}
      </div>
    </div>
  );
}
