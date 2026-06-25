import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, MessageSquare, Phone, FileWarning, CheckCircle, Clock } from 'lucide-react';

export default function Support() {
  const tickets = [
    { id: '#4512', subject: 'Payment Delay - Site A', status: 'In Progress', date: '24 May' },
    { id: '#4490', subject: 'Profile Verification', status: 'Resolved', date: '12 May' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="text-brand-primary" size={32} />
          <h1 className="font-display text-4xl font-black text-brand-ink uppercase tracking-tight">
            Support & Grievance
          </h1>
        </div>
        <p className="text-brand-muted">Report issues with contractors, track your queries, or talk to our advocacy agents.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { 
            label: 'Chat with Us', 
            icon: MessageSquare, 
            color: 'text-blue-500', 
            onClick: () => window.open('https://wa.me/919999999999?text=Hello%20Karmik%20Setu%20Support', '_blank')
          },
          { 
            label: 'Call Support', 
            icon: Phone, 
            color: 'text-emerald-500', 
            onClick: () => window.location.href = 'tel:+919876543210'
          },
          { 
            label: 'Report Issue', 
            icon: FileWarning, 
            color: 'text-rose-500', 
            onClick: () => {
              const subject = encodeURIComponent('Grievance Report - Karmik Setu');
              const body = encodeURIComponent('Please describe your issue here...');
              window.location.href = `mailto:support@karmiksetu.org?subject=${subject}&body=${body}`;
            }
          },
        ].map((item, idx) => (
          <button 
            key={idx}
            onClick={item.onClick}
            className="bg-white p-8 rounded-[2rem] border border-brand-ink/5 shadow-sm hover:border-brand-primary/20 transition-all flex flex-col items-center gap-4 group"
          >
            <item.icon size={32} className={`${item.color} group-hover:scale-110 transition-transform`} />
            <span className="font-bold text-brand-ink uppercase tracking-widest text-xs">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-brand-ink/5">
        <h3 className="font-bold text-brand-ink mb-6">Recent Tickets</h3>
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between p-5 bg-brand-paper rounded-2xl">
              <div className="flex gap-4 items-center">
                <div className={`p-2 rounded-lg ${ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                  {ticket.status === 'Resolved' ? <CheckCircle size={20} /> : <Clock size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-ink">{ticket.subject}</h4>
                  <p className="text-[10px] font-black uppercase text-brand-muted tracking-widest">{ticket.id} • {ticket.date}</p>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {ticket.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
