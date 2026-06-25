import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Heart, Users, Globe, TrendingUp, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ImpactReport() {
  const impactStats = [
    { label: 'Families Impacted', value: '1,240', icon: Heart, color: 'bg-rose-500', trend: '+12%' },
    { label: 'Wages Formalized', value: '₹1.8 Cr', icon: TrendingUp, color: 'bg-emerald-500', trend: '+24%' },
    { label: 'Credit Enabled', value: '450+', icon: Users, color: 'bg-blue-500', trend: '+8%' },
    { label: 'CSR Compliance', value: '98%', icon: Leaf, color: 'bg-brand-primary', trend: 'Stable' },
  ];

  const socialInclusionData = [
    { month: 'Jan', impact: 400 },
    { month: 'Feb', impact: 600 },
    { month: 'Mar', impact: 900 },
    { month: 'Apr', impact: 1200 },
    { month: 'May', impact: 1550 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <Globe className="text-brand-primary" size={32} />
          <h1 className="font-display text-4xl font-black text-brand-ink uppercase tracking-tight">
            Impact & ESG
          </h1>
        </div>
        <p className="text-brand-muted">Measuring your organization's contribution to social mobility and financial inclusion.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {impactStats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-brand-ink/5 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                <stat.icon size={24} />
              </div>
              <div className="flex items-center text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                {stat.trend} <ArrowUpRight size={10} className="ml-1" />
              </div>
            </div>
            <div className="text-3xl font-black text-brand-ink mb-1">{stat.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-brand-muted">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-brand-ink/5">
          <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-3 text-brand-ink">
            Social Inclusion Index
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={socialInclusionData}>
                <defs>
                  <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#5A5A40" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 'bold', fill: '#404038' }} 
                />
                <YAxis 
                  hide
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="impact" 
                  stroke="#5A5A40" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorImpact)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-ink text-white p-8 rounded-[2.5rem]">
            <h3 className="font-black uppercase text-sm mb-4 tracking-widest">ESG Summary</h3>
            <p className="text-xs text-white/60 leading-relaxed mb-6">
              Your organization is currently in the <strong>Top 5%</strong> of organization partners facilitating micro-credit through verified labor data.
            </p>
            <div className="space-y-4">
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-primary h-full w-[85%]" />
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                <span>Social Impact</span>
                <span>85/100</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-paper p-8 rounded-[2.5rem] border border-brand-ink/5">
            <h3 className="font-bold text-brand-ink mb-2">Sustainable Development Goal</h3>
            <p className="text-sm text-brand-muted">Focusing on SDG 8: Decent Work and Economic Growth.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
