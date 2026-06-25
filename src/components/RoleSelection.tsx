import React from 'react';
import { motion } from 'framer-motion';
import { User, Building2, ArrowRight, Briefcase } from 'lucide-react';
import { UserRole } from '../types';
import { Languages, Check } from 'lucide-react';

interface RoleSelectionProps {
  onSelect: (role: UserRole) => void;
  t: any;
  lang: string;
  onLanguageChange: (lang: string) => void;
}

const LANGUAGES = [
  { id: 'en', name: 'English' },
  { id: 'hi', name: 'हिंदी' },
  { id: 'kn', name: 'ಕನ್ನಡ' },
  { id: 'ta', name: 'தமிழ்' },
  { id: 'te', name: 'తెలుగు' },
  { id: 'mr', name: 'मराठी' },
  { id: 'bn', name: 'বাংলা' }
];

export default function RoleSelection({ onSelect, t, lang, onLanguageChange }: RoleSelectionProps) {
  return (
    <div className="min-h-screen bg-brand-paper flex flex-col p-4">
      {/* Language Switcher for Registration */}
      <div className="max-w-6xl w-full mx-auto flex justify-end mb-8 pt-4">
        <div className="bg-white rounded-2xl border border-brand-ink/5 shadow-sm p-1 flex items-center gap-1">
          <div className="px-3 text-brand-muted">
            <Languages size={18} />
          </div>
          <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[200px] md:max-w-none">
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                onClick={() => onLanguageChange(l.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                  lang === l.id 
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                    : "text-brand-muted hover:bg-brand-paper hover:text-brand-ink"
                }`}
              >
                {l.name}
                {lang === l.id && <Check size={10} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col justify-center pb-20">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-black text-6xl md:text-8xl tracking-tighter uppercase mb-6 text-brand-ink leading-[0.85]"
          >
            Karmik<br/>
            <span className="text-brand-primary">Setu</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-brand-muted max-w-xl mx-auto font-medium"
          >
            {t.tagline}
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 px-4 relative z-10">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-brand-ink/5 hidden md:block" />
          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-brand-ink/5 hidden md:block" />
          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-brand-ink/5 hidden md:block" />
          {/* Worker Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => onSelect('worker')}
            className="group relative bg-white p-8 rounded-[2.5rem] border border-brand-ink/5 shadow-xl hover:shadow-2xl transition-all text-left flex flex-col h-full"
          >
            <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-brand-primary/20">
              <User size={32} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-brand-ink">{t.workerRole}</h3>
            <p className="text-brand-muted mb-8 flex-1">{t.workerDesc}</p>
            <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest text-brand-primary mt-auto">
              {t.getStarted} <ArrowRight size={16} />
            </div>
          </motion.button>

          {/* Contractor Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => onSelect('contractor')}
            className="group relative bg-white p-8 rounded-[2.5rem] border border-brand-ink/5 shadow-xl hover:shadow-2xl transition-all text-left flex flex-col h-full"
          >
            <div className="w-16 h-16 bg-[#FF6B35] rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/20">
              <Briefcase size={32} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-brand-ink">{t.contractorRole}</h3>
            <p className="text-brand-muted mb-8 flex-1">{t.contractorDesc}</p>
            <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest text-[#FF6B35] mt-auto">
              {t.hiringNow} <ArrowRight size={16} />
            </div>
          </motion.button>

          {/* Organization Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => onSelect('organization')}
            className="group relative bg-white p-8 rounded-[2.5rem] border border-brand-ink/5 shadow-xl hover:shadow-2xl transition-all text-left flex flex-col h-full"
          >
            <div className="w-16 h-16 bg-brand-ink rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
              <Building2 size={32} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-brand-ink">{t.orgRole}</h3>
            <p className="text-brand-muted mb-8 flex-1">{t.orgDesc}</p>
            <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest text-brand-ink mt-auto">
              {t.partnerWithUs} <ArrowRight size={16} />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
