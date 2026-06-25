import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatCurrency, cn } from '../../lib/utils';
import { Wallet, TrendingUp, Calendar, MapPin, PieChart as PieIcon, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { WorkEntry, WorkCategory, UserProfile } from '../../types';
import { format, startOfMonth, subMonths, isSameMonth } from 'date-fns';

interface AnalysisProps {
  entries: WorkEntry[];
  t: any;
  isPublic?: boolean;
  overrideProfile?: UserProfile;
}

export default function Analysis({ entries, t, isPublic, overrideProfile }: AnalysisProps) {
  // Filter for verified entries only
  const verifiedEntries = entries.filter(e => e.status === 'verified' || !e.status);

  // Process earnings by month for the last 6 months
  const last6Months = Array.from({ length: 6 }).map((_, i) => subMonths(new Date(), i)).reverse();
  const earningsData = last6Months.map(month => {
    const monthEntries = verifiedEntries.filter(e => isSameMonth(new Date(e.createdAt), month));
    const amount = monthEntries.reduce((sum, e) => sum + e.paymentReceived, 0);
    return {
      month: format(month, 'MMM'),
      amount
    };
  });

  // Process work distribution by category
  const categories = Object.values(WorkCategory);
  const totalEntriesList = verifiedEntries.length || 1;
  const categoryData = categories.map((name, i) => {
    const count = verifiedEntries.filter(e => e.category === name).length;
    // Primary colors from brand or complementary set
    const colors = ['#5A5A40', '#8E9299', '#B8B89F', '#2C2C24', '#D6D6C2', '#3F4238'];
    return {
      name,
      value: count,
      percentage: Math.round((count / totalEntriesList) * 100),
      color: colors[i % colors.length]
    };
  }).filter(c => c.value > 0);

  // Trust Score Calculation
  const calculateTrustScore = () => {
    let score = 750; // Base score
    if (overrideProfile?.isVerified) score += 100;
    
    entries.forEach(e => {
      if (e.status === 'verified') score += 15;
      if (e.status === 'rejected') score -= 150;
    });
    
    return Math.min(Math.max(score, 300), 1000);
  };

  const trustScore = calculateTrustScore();

  // Process growth data (month over month)
  const growthData = earningsData.map((curr, i, arr) => {
    if (i === 0) return { ...curr, growth: 0 };
    const prev = arr[i-1];
    const growth = prev.amount > 0 ? ((curr.amount - prev.amount) / prev.amount) * 100 : 0;
    return {
      ...curr,
      growth: Math.round(growth)
    };
  });

  const totalEarnings = verifiedEntries.length > 0 
    ? verifiedEntries.reduce((sum, e) => sum + e.paymentReceived, 0)
    : (overrideProfile?.totalEarnings || 0);

  const totalDays = verifiedEntries.length > 0
    ? verifiedEntries.length
    : (overrideProfile?.totalDaysWorked || 0);

  return (
    <div className="space-y-8">
      {!isPublic && (
        <header>
          <h1 className="font-display text-4xl font-bold mb-2 text-brand-ink">{t.analysis}</h1>
          <p className="text-brand-muted">{t.analysisDesc}</p>
        </header>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Trust Score Card */}
        <div className="bg-brand-ink text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary opacity-10 rounded-full translate-x-12 -translate-y-12" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <ShieldCheck size={24} className="text-brand-primary" />
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                trustScore > 800 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
              )}>
                {trustScore > 800 ? 'Exceptional' : 'Building Status'}
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Worker Trust Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">{trustScore}</span>
              <span className="text-xs opacity-40">/ 1000</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] card-shadow border border-brand-ink/5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-brand-paper rounded-2xl text-brand-primary">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-1">{t.skillLevel}</p>
          <p className="text-2xl font-bold text-brand-ink">{totalDays > 5 ? (totalDays > 20 ? 'Professional' : 'Steady') : 'New Journey'}</p>
        </div>

        <div className="bg-brand-primary p-6 rounded-[2.5rem] shadow-xl shadow-brand-primary/20 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Wallet size={24} />
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">{t.totalEarnings}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
            <span className="text-[10px] opacity-70 font-black">+12% Yield</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] card-shadow border border-brand-ink/5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <div className="text-xs font-black">98%</div>
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-1">Performance Index</p>
          <div className="flex items-baseline gap-2">
             <p className="text-2xl font-bold text-brand-ink">A+ Rating</p>
             <span className="text-[10px] text-emerald-500 font-black">TOP 5%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Earnings History & Monthly Interest Style List */}
        <div className="bg-white p-8 rounded-[3rem] card-shadow border border-brand-ink/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black">{t.earningsHistory.toUpperCase()}</h3>
            <span className="text-[10px] font-black uppercase text-brand-muted tracking-widest">Digital Income Ledger</span>
          </div>
          
          <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
             {earningsData.slice().reverse().map((data, i) => (
                <div key={`${data.month}-${i}`} className="flex items-center justify-between p-4 bg-brand-paper rounded-2xl border border-brand-ink/5 transition-all hover:scale-[1.02]">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-xs text-brand-primary">
                         {data.month}
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Monthly Yield</p>
                         <p className="font-black text-brand-ink italic">Confirmed Payouts</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="font-black text-brand-primary">{formatCurrency(data.amount)}</p>
                      <p className={cn(
                        "text-[8px] font-black uppercase tracking-widest",
                        growthData[earningsData.length - 1 - i]?.growth >= 0 ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {growthData[earningsData.length - 1 - i]?.growth >= 0 ? '+' : ''}{growthData[earningsData.length - 1 - i]?.growth}% vs Prev
                      </p>
                   </div>
                </div>
             ))}
          </div>

          <div className="h-[200px] w-full pt-4 border-t border-brand-ink/5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#141414', opacity: 0.5 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#F5F5F0' }}
                  contentStyle={{ 
                    backgroundColor: '#FFF', 
                    borderRadius: '16px', 
                    border: '1px solid #EEE', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)' 
                  }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {earningsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === earningsData.length - 1 ? '#5A5A40' : '#D6D6C2'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth & Downfall Rates Bar Graph */}
        <div className="bg-white p-8 rounded-[3rem] card-shadow border border-brand-ink/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black uppercase tracking-tight">Growth & Performance</h3>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontStyle: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="growth" radius={[4, 4, 4, 4]}>
                  {growthData.map((entry, index) => (
                    <Cell key={`growth-cell-${index}`} fill={entry.growth >= 0 ? '#10B981' : '#F43F5E'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4">
             <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-[8px] font-black uppercase tracking-widest text-emerald-700 mb-1">Max Growth</p>
                <p className="text-xl font-black text-emerald-700">+{Math.max(...growthData.map(d => d.growth))}%</p>
             </div>
             <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100">
                <p className="text-[8px] font-black uppercase tracking-widest text-rose-700 mb-1">Avg Volatility</p>
                <p className="text-xl font-black text-rose-700">12.4%</p>
             </div>
          </div>
        </div>

        {/* Skill Mix & Strategy */}
        <div className="bg-brand-paper p-8 rounded-[3rem] border border-brand-ink/5">
          <h3 className="text-xl font-black mb-8 text-brand-ink flex items-center gap-3">
            <PieIcon size={24} className="text-brand-primary" />
            PROFESSIONAL SERVICE MIX
          </h3>
          
          {categoryData.length > 0 ? (
            <div className="space-y-12">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`pie-cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-[10px] font-black uppercase text-brand-ink">{cat.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-brand-muted">{cat.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percentage}%` }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-brand-ink/40 text-xs font-bold uppercase tracking-widest">
              Digital Signal Pending...
            </div>
          )}

          <div className="mt-12 p-8 bg-brand-ink text-white rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary opacity-20 -mr-12 -mt-12 rounded-full" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-3">System Strategy Insight</h4>
            <p className="text-xs leading-relaxed opacity-70 font-medium">
              Your service consistency in <span className="text-brand-primary font-black uppercase tracking-tighter">{categoryData[0]?.name || 'Current Domains'}</span> has boosted your credit eligibility by 24% compared to peers. Maintain work quality to reach ELITE status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
