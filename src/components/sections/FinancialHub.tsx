import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, CreditCard, ShieldCheck, TrendingUp, ArrowUpRight, Zap, CheckCircle, Info, ExternalLink, X } from 'lucide-react';
import { UserProfile, WorkEntry } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface FinancialHubProps {
  profile: UserProfile | null;
  entries: WorkEntry[];
}

interface Loan {
  id: string;
  name: string;
  provider: string;
  amount: string;
  interest: string;
  tenure: string;
  type: string;
  benefits: string[];
  link: string;
}

export default function FinancialHub({ profile, entries }: FinancialHubProps) {
  const [showLoanModal, setShowLoanModal] = useState(false);
  
  const verifiedCount = entries.filter(e => e.status === 'verified').length;
  const trustScore = Math.min(Math.max(750 + (profile?.isVerified ? 100 : 0) + (verifiedCount * 15), 300), 1000);
  
  const eligibleAmount = trustScore > 850 ? '₹1,00,000' : (trustScore > 700 ? '₹50,000' : '₹10,000');

  const finStats = [
    { label: 'Loan Eligibility', value: eligibleAmount, icon: Landmark, color: 'text-emerald-500' },
    { label: 'Credit Score', value: trustScore.toString(), icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Insured Cover', value: '₹2.0 Lakhs', icon: ShieldCheck, color: 'text-brand-primary' },
  ];

  const eligibleLoans: Loan[] = [
    {
      id: 'svanidhi',
      name: 'PM SVANidhi',
      provider: 'Govt. of India',
      amount: 'Up to ₹50,000',
      interest: '7% Subsidized',
      tenure: '12 Months',
      type: 'Micro-credit',
      benefits: ['No collateral required', 'Interest subsidy @ 7%', 'Cashback on digital transactions'],
      link: 'https://pmsvanidhi.mohua.gov.in/'
    },
    {
      id: 'mudra-shishu',
      name: 'MUDRA - Shishu',
      provider: 'PMMY',
      amount: 'Up to ₹50,000',
      interest: '9-12% p.a.',
      tenure: 'Up to 5 Years',
      type: 'Business Setup',
      benefits: ['Zero processing fee', 'Help in starting small business', 'Available at all scheduled banks'],
      link: 'https://www.mudra.org.in/'
    },
    {
      id: 'betterplace',
      name: 'Betterplace Money',
      provider: 'Betterplace Finance',
      amount: '₹5,000 - ₹25,000',
      interest: '2% per month',
      tenure: '3-6 Months',
      type: 'Instant Cash',
      benefits: ['Paperless application', 'Same-day disbursal', 'Based on Shramik Setu score'],
      link: 'https://www.betterplace.co.in/worker-benefits/fintech/'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-brand-ink text-white rounded-2xl">
            <CreditCard size={24} />
          </div>
          <h1 className="font-display text-4xl font-black text-brand-ink uppercase tracking-tight">
            Financial Hub
          </h1>
        </div>
        <p className="text-brand-muted">Verified credit and financial services powered by your work reputation.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {finStats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-brand-ink/5 shadow-sm relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-brand-paper rounded-2xl flex items-center justify-center text-brand-ink">
                <stat.icon size={24} className={stat.color} />
              </div>
              <Info size={16} className="text-brand-ink/10 group-hover:text-brand-ink/30 transition-colors" />
            </div>
            <div className="text-3xl font-black text-brand-ink mb-1">{stat.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-brand-muted">{stat.label}</div>
            
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-paper rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-brand-ink text-white p-10 rounded-[3rem] relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-brand-ink/20">
          <div>
            <div className="inline-block px-3 py-1 bg-brand-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
              Verified Offer
            </div>
            <h2 className="text-4xl font-black uppercase leading-none mb-6">
              Instant <br /> Micro-Loan
            </h2>
            <p className="text-white/60 mb-8 text-sm leading-relaxed max-w-[80%]">
              Your Shramik Setu Trust Score of <strong>{trustScore}</strong> makes you eligible for pre-approved loans from our Indian banking partners.
            </p>
          </div>
          
          <button 
            onClick={() => setShowLoanModal(true)}
            className="bg-white text-brand-ink px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#F5F5F0] transition-all flex items-center justify-center gap-2 w-full mt-4"
          >
            Check Eligible Loans <ArrowUpRight size={18} />
          </button>
          
          <Zap className="absolute -bottom-10 -right-10 text-white/5 pointer-events-none" size={240} />
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-brand-ink/5 space-y-8 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-black uppercase tracking-widest text-xs text-brand-muted mb-8">Banking Partners</h3>
            <div className="space-y-4">
              {[
                { name: 'State Bank of India', tag: 'Micro-Fin Lead' },
                { name: 'HDFC Bank', tag: 'Gold Partner' },
                { name: 'Bank of Baroda', tag: 'Rural Credit' }
              ].map((bank) => (
                <div key={bank.name} className="flex items-center justify-between p-5 bg-brand-paper rounded-[1.5rem] border border-brand-ink/5 hover:border-brand-ink/20 transition-colors">
                  <div>
                    <div className="font-black text-sm text-brand-ink">{bank.name}</div>
                    <div className="text-[10px] text-brand-muted font-bold">{bank.tag}</div>
                  </div>
                  <CheckCircle size={20} className="text-brand-primary" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-6 border-t border-brand-ink/5">
             <p className="text-[10px] text-brand-muted font-medium text-center italic">
               Loan interest rates are capped at 1.5% monthly for all Shramik Setu members.
             </p>
          </div>
        </div>
      </div>

      {/* Loan Selection Modal */}
      <AnimatePresence>
        {showLoanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 lg:p-8"
          >
            <div className="absolute inset-0 bg-brand-ink/40 backdrop-blur-md" onClick={() => setShowLoanModal(false)} />
            
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-brand-paper w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-8 lg:p-12 relative shadow-2xl"
            >
              <button 
                onClick={() => setShowLoanModal(false)}
                className="absolute right-8 top-8 p-3 hover:bg-brand-ink/5 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-10">
                <h2 className="text-3xl font-black uppercase mb-2">Eligible Loan Schemes</h2>
                <p className="text-brand-muted text-sm italic">Showing government and private micro-credit options based on your verified profile.</p>
              </div>

              <div className="grid gap-6">
                {eligibleLoans.map((loan) => (
                  <div key={loan.id} className="bg-white p-8 rounded-[2rem] border border-brand-ink/10 hover:border-brand-primary/40 transition-all group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-paper px-3 py-1 rounded-full">{loan.type}</span>
                           <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">{loan.provider}</span>
                        </div>
                        <h3 className="text-2xl font-black uppercase">{loan.name}</h3>
                      </div>
                      
                      <div className="flex items-end gap-8">
                        <div className="text-right">
                          <div className="text-[10px] font-black uppercase text-brand-muted mb-1">Max Amount</div>
                          <div className="text-xl font-black">{loan.amount}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-black uppercase text-brand-muted mb-1">Interest</div>
                          <div className="text-xl font-black text-emerald-600">{loan.interest}</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-end">
                      <div className="space-y-3">
                        {loan.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-center gap-3 text-xs font-bold text-brand-muted">
                            <CheckCircle size={14} className="text-brand-primary" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                      
                      <a 
                        href={loan.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-brand-ink text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-brand-primary transition-all shadow-lg shadow-brand-ink/20"
                      >
                        Apply on Official Portal <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-8 bg-brand-ink/5 rounded-[2rem] border border-dashed border-brand-ink/10 text-center">
                 <p className="text-sm font-bold text-brand-muted">
                   Need help applying? Contact our <span className="text-brand-ink underline">Financial Support desk</span> for document preparation help.
                 </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
