import React from 'react';
import { motion } from 'framer-motion';
import { PieChart as PieIcon, BarChart3, TrendingUp, Users, Target, Zap, Clock, IndianRupee } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line } from 'recharts';

export default function ContractorAnalysis() {
  // Hiring trends
  const laborData = [
    { name: 'Construction', value: 120, color: '#FF6B35' },
    { name: 'Masonry', value: 80, color: '#141414' },
    { name: 'Carpentry', value: 40, color: '#8E9299' },
    { name: 'Logistics', value: 30, color: '#D6D6C2' },
  ];

  const verificationTrend = [
    { day: 'Mon', count: 12, cost: 6000 },
    { day: 'Tue', count: 15, cost: 7500 },
    { day: 'Wed', count: 8, cost: 4000 },
    { day: 'Thu', count: 22, cost: 11000 },
    { day: 'Fri', count: 18, cost: 9000 },
    { day: 'Sat', count: 25, cost: 12500 },
    { day: 'Sun', count: 5, cost: 2500 },
  ];

  const totalVerified = laborData.reduce((sum, item) => sum + item.value, 0);
  const totalPayout = verificationTrend.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="space-y-8 pb-12">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="text-orange-500" size={32} />
          <h1 className="font-display text-4xl font-black text-brand-ink uppercase tracking-tight">
            Workforce Insights
          </h1>
        </div>
        <p className="text-brand-muted">Performance metrics and financial trends of your verified worker pool.</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Workers', value: totalVerified, icon: Users, color: 'text-orange-500' },
          { label: 'Active Today', value: 12, icon: Clock, color: 'text-brand-ink' },
          { label: 'Weekly Payout', value: `₹${(totalPayout / 1000).toFixed(1)}k`, icon: IndianRupee, color: 'text-emerald-500' },
          { label: 'Verify Rate', value: '98%', icon: Zap, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-brand-ink/5 shadow-sm">
            <stat.icon className={stat.color} size={24} />
            <div className="mt-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">{stat.label}</p>
              <p className="text-2xl font-black text-brand-ink">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Skill Type Distribution */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-brand-ink/5">
          <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-3 text-brand-ink">
            <PieIcon className="text-orange-500" />
            Skill Distribution
          </h2>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={laborData}
                   innerRadius={60}
                   outerRadius={90}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {laborData.map((entry, index) => (
                     <Cell key={index} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                 <Legend />
               </PieChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Payout & Attendance Hub */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-brand-ink/5">
          <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-3 text-brand-ink">
            <BarChart3 className="text-orange-500" />
            Daily Verified Payouts
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={verificationTrend}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, opacity: 0.5 }} />
                <Tooltip cursor={{ fill: '#F5F5F0' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Bar dataKey="cost" fill="#FF6B35" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Productivity Insight */}
      <div className="bg-brand-ink text-white p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-black uppercase">Identity Verified Score</h3>
          <p className="text-white/60 text-sm max-w-xl">
            92% of your hired workers are Aadhaar-linked and Karmik Setu verified. 
            This increases your compliance score by 15 points this month.
          </p>
        </div>
        <div className="w-24 h-24 rounded-full border-8 border-orange-500 flex items-center justify-center font-black text-2xl">
          92%
        </div>
      </div>
    </div>
  );
}
