import React from 'react';
import { motion } from 'framer-motion';
import { PieChart as PieIcon, BarChart3, TrendingUp, Users, Target, Zap } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

export default function OrgAnalysis() {
  // Sector distribution dummy data
  const laborDistribution = [
    { name: 'Construction', value: 450, color: '#5A5A40' },
    { name: 'Manufacturing', value: 300, color: '#8E9299' },
    { name: 'Logistics', value: 150, color: '#B8B89F' },
    { name: 'Agriculture', value: 80, color: '#D6D6C2' },
    { name: 'Services', value: 50, color: '#2C2C24' },
  ];

  // Credit score trend dummy data
  const creditTrend = [
    { month: 'Jan', score: 680, active: 400 },
    { month: 'Feb', score: 695, active: 450 },
    { month: 'Mar', score: 710, active: 520 },
    { month: 'Apr', score: 720, active: 580 },
    { month: 'May', score: 735, active: 650 },
  ];

  const totalWorkers = laborDistribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-8 pb-12">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="text-brand-primary" size={32} />
          <h1 className="font-display text-4xl font-black text-brand-ink uppercase tracking-tight">
            Organization Analytics
          </h1>
        </div>
        <p className="text-brand-muted">Comprehensive data analysis of your verified workforce pool and credit readiness trends.</p>
      </header>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-brand-ink/5 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Total Monitored</span>
          </div>
          <div className="text-3xl font-black text-brand-ink">{totalWorkers.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">+12% from last month</div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-brand-ink/5 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Target size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Avg Credit Readiness</span>
          </div>
          <div className="text-3xl font-black text-brand-ink">735</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">Increasing Trend</div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-brand-ink/5 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <Zap size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Verification Rate</span>
          </div>
          <div className="text-3xl font-black text-brand-ink">94.2%</div>
          <div className="text-[10px] text-brand-muted font-bold mt-1">Real-time synced</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Sector Distribution Pie Chart */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-brand-ink/5 flex flex-col">
          <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-3 text-brand-ink">
            <PieIcon className="text-brand-primary" />
            Labor Pool Distribution
          </h2>
          <div className="flex-1 flex flex-col md:flex-row items-center gap-8">
            <div className="h-[280px] w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={laborDistribution}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {laborDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4 w-full">
              {laborDistribution.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-bold text-brand-ink">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-brand-muted">{Math.round((item.value / totalWorkers) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-brand-paper rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.value / totalWorkers) * 100}%` }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Credit Trends Bar Chart */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-brand-ink/5">
          <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-3 text-brand-ink">
            <TrendingUp className="text-brand-primary" />
            Credit Readiness Evolution
          </h2>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={creditTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 'bold', fill: '#404038' }} 
                />
                <YAxis 
                  domain={[600, 800]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#404038', opacity: 0.5 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="score" 
                  fill="#5A5A40" 
                  radius={[10, 10, 0, 0]} 
                  barSize={40}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-4 bg-brand-paper rounded-2xl border border-brand-ink/5">
            <p className="text-[10px] text-brand-muted leading-relaxed uppercase font-bold tracking-wider">
              Note: This trend accounts for aggregate work consistency, payroll formalization, and historical repayment signals within your institution's region.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
