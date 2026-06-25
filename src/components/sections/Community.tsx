import React from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Landmark, ExternalLink, Heart, Bell } from 'lucide-react';

export default function Community() {
  const schemes = [
    { title: 'PM Shram Yogi Maan-dhan', category: 'Pension', status: 'Eligible', icon: <Landmark size={20} /> },
    { title: 'e-Shram Portal', category: 'Registration', status: 'Verified', icon: <Shield size={20} /> },
    { title: 'Pradhan Mantri Suraksha Bima Yojana', category: 'Insurance', status: 'Check Status', icon: <Heart size={20} /> },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <Users className="text-brand-primary" size={32} />
          <h1 className="font-display text-4xl font-black text-brand-ink uppercase tracking-tight">
            Community & Benefits
          </h1>
        </div>
        <p className="text-brand-muted">Stay informed about government schemes, health benefits, and local labor unions.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-lg text-brand-ink">Active Schemes</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline">View All</button>
          </div>
          
          {schemes.map((scheme, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-[2rem] border border-brand-ink/5 flex items-center gap-6 shadow-sm group hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                {scheme.icon}
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">{scheme.category}</p>
                <h4 className="font-bold text-brand-ink text-sm leading-tight">{scheme.title}</h4>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                  scheme.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-paper text-brand-primary'
                }`}>
                  {scheme.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-brand-ink text-white p-8 rounded-[2.5rem] relative overflow-hidden h-full">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="text-brand-primary" size={24} />
              <h3 className="font-black uppercase text-sm tracking-widest">Latest Updates</h3>
            </div>
            
            <div className="space-y-8">
              <div className="border-l-2 border-brand-primary pl-6 py-1">
                <p className="text-xs text-white/50 mb-1">2 days ago</p>
                <h4 className="font-bold text-sm mb-2">New Insurance Scheme for Construction Workers</h4>
                <p className="text-xs text-white/40 leading-relaxed">The state government has announced a new accidental insurance cover of up to ₹2 Lakhs.</p>
              </div>
              <div className="border-l-2 border-white/10 pl-6 py-1">
                <p className="text-xs text-white/50 mb-1">1 week ago</p>
                <h4 className="font-bold text-sm mb-2">Bank of India: Special Savings Account</h4>
                <p className="text-xs text-white/40 leading-relaxed">Simplified zero-balance savings accounts now available for Setu verified Workers.</p>
              </div>
            </div>

            <button className="mt-12 w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
              Join Community Forum <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
