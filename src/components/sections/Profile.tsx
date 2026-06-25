import React, { useState } from 'react';
import { User, Phone, MapPin, Calendar, Wallet, Award, Download, Share2, Mail, X, Save, Copy, ShieldCheck, Camera, Loader2, CheckCircle2, Smartphone, FileText } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { UserProfile, HireRequest } from '../../types';
import { useFirebaseData } from '../../contexts/FirebaseContext';
import { Briefcase } from 'lucide-react';

interface ProfileProps {
  profile: UserProfile | null;
  t: any;
  onUpdate: (updates: Partial<UserProfile>) => Promise<void>;
  onNavigate?: (section: any) => void;
}

export default function Profile({ profile, t, onUpdate, onNavigate }: ProfileProps) {
  const { hireRequests } = useFirebaseData();
  const pendingRequests = (hireRequests || []).filter((r: HireRequest) => r.status === 'pending');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerifyMock, setShowVerifyMock] = useState(false);

  const user = profile || {
    uid: "guest",
    name: "Guest User",
    phone: "Not Verified",
    email: "notavailable@example.com",
    aadhaarMasked: "XXXX XXXX XXXX",
    totalDaysWorked: 0,
    totalEarnings: 0,
    preferredLanguage: "en",
    address: "Please complete registration",
    setuId: "SS-NEW",
    isVerified: false,
    role: "worker",
    status: "available",
    photoUrl: "",
    pan: ""
  };

  const statCards = [
    { label: t.totalDays, value: user.totalDaysWorked, icon: Calendar, color: "bg-blue-50 text-blue-600" },
    { label: t.totalEarnings, value: formatCurrency(user.totalEarnings), icon: Wallet, color: "bg-green-50 text-green-600" },
    { label: t.skillLevel, value: user.totalDaysWorked > 100 ? "Senior Mason" : "Helper", icon: Award, color: "bg-amber-50 text-amber-600" },
  ];

  const handleVerify = async () => {
    setIsVerifying(true);
    // Simulate Aadhaar Photo Matching API
    await new Promise(resolve => setTimeout(resolve, 3000));
    await onUpdate({ isVerified: true });
    setIsVerifying(false);
    setShowVerifyMock(false);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = () => {
    // Manually trigger the hidden input
    const input = document.getElementById('photo-capture') as HTMLInputElement;
    if (input) input.click();
  };

  const downloadQR = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Karmik_Setu_QR_${user.setuId}.png`;
      link.href = url;
      link.click();
    }
  };

  const shareProfile = async () => {
    const shareUrl = `${window.location.origin}/view/${user.setuId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Karmik Setu Profile: ${user.name}`,
          text: `Check out the verified work history of ${user.name} (ID: ${user.setuId})`,
          url: shareUrl,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert("Profile link copied to clipboard: " + shareUrl);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold mb-2">{t.profile}</h1>
          <p className="text-brand-ink/60">{t.tagline}</p>
        </div>
        {!user.isVerified && (
          <button 
            onClick={() => setShowVerifyMock(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-xl font-bold text-xs hover:bg-brand-primary hover:text-white transition-all animate-pulse"
          >
            <ShieldCheck size={16} /> {t.authenticateAadhaar}
          </button>
        )}
        {user.role === 'worker' && (
          <div className="flex bg-brand-paper p-1.5 rounded-2xl border border-brand-ink/5 shadow-sm">
            {(['working', 'available', 'offline'] as const).map((status) => (
              <button
                key={status}
                onClick={() => onUpdate({ status })}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  user.status === status 
                    ? "bg-brand-ink text-white shadow-lg" 
                    : "text-brand-muted hover:bg-brand-ink/5"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </header>
      {/* Pending Job Offers Alert */}
      {pendingRequests.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-primary p-6 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-brand-primary/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-bounce">
              <Briefcase size={24} />
            </div>
            <div>
              <h3 className="font-black text-lg uppercase tracking-tight leading-none mb-1">{t.newJobOffers}</h3>
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest">{t.pendingHireRequests?.replace('{count}', pendingRequests.length.toString())}</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate?.('hire-workers')}
            className="w-full md:w-auto px-8 py-3 bg-white text-brand-primary rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-paper transition-all shadow-lg"
          >
            {t.reviewOffers}
          </button>
        </motion.div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-[2.5rem] p-8 card-shadow border border-brand-ink/5 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        {user.isVerified && (
          <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm z-10">
            <CheckCircle2 size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">{t.verifiedWorker}</span>
          </div>
        )}

        <div className="relative group shrink-0">
          <input 
            type="file" 
            id="photo-capture" 
            accept="image/*" 
            capture="user" 
            className="hidden" 
            onChange={handlePhotoCapture}
          />
          <div className="w-40 h-40 bg-brand-paper rounded-[2.5rem] flex items-center justify-center text-brand-muted border-4 border-white shadow-xl overflow-hidden relative">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={64} />
            )}
            
            {user.role === 'worker' && user.status && (
              <div className={cn(
                "absolute bottom-4 right-4 w-5 h-5 rounded-full border-4 border-white shadow-sm z-20",
                user.status === 'working' ? "bg-emerald-500 animate-pulse" :
                user.status === 'available' ? "bg-amber-500" : "bg-slate-400"
              )} />
            )}
          </div>
          <button 
            onClick={handlePhotoUpload}
            className="absolute -bottom-2 -right-2 p-3 bg-white text-brand-ink rounded-2xl shadow-lg hover:text-brand-primary transition-all border border-brand-ink/5"
          >
            <Camera size={20} />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left pt-4 relative">
          <div className="flex flex-col md:flex-row items-center md:items-start md:gap-4 mb-4">
            <div>
              <h2 className="text-3xl font-black text-brand-ink mb-1">{user.name}</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(user.setuId);
                    alert((t.idCopied || "ID Copied") + ": " + user.setuId);
                  }}
                  className="group relative flex items-center gap-2 bg-brand-ink text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-sm"
                >
                  {user.setuId}
                  <Copy size={12} className="opacity-60 group-hover:opacity-100" />
                </button>

                <button 
                  onClick={() => {
                    setFormData({
                      name: user.name,
                      phone: user.phone,
                      email: user.email,
                      address: user.address,
                    });
                    setIsEditing(true);
                  }}
                  className="px-4 py-1.5 bg-brand-paper text-brand-ink rounded-full font-bold hover:bg-brand-ink hover:text-white transition-all text-[10px] uppercase tracking-widest border border-brand-ink/5 shadow-sm"
                >
                  {t.editProfile}
                </button>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 md:absolute md:top-0 md:right-0">
              {user.role === 'worker' && (
                <button 
                  onClick={() => onNavigate?.('job-board')}
                  className="px-8 py-3 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-ink transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2 border-2 border-brand-primary hover:border-brand-ink"
                >
                  <Briefcase size={16} />
                  {t.browseWork}
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-3 mt-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-brand-muted tracking-widest mb-1">Aadhaar</span>
              <span className="flex items-center gap-2 text-sm font-bold text-brand-ink">
                <ShieldCheck size={14} className="text-brand-primary" /> {user.aadhaarMasked}
              </span>
            </div>
            {user.pan && (
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-brand-muted tracking-widest mb-1">PAN Card</span>
                <span className="flex items-center gap-2 text-sm font-bold text-brand-ink">
                  <ShieldCheck size={14} className="text-brand-primary" /> {user.pan.replace(/.(?=.{4})/g, 'X')}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-brand-muted tracking-widest mb-1">Contact</span>
              <span className="flex items-center gap-2 text-sm font-bold text-brand-ink">
                <Smartphone size={14} className="text-brand-primary" /> {user.phone}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-brand-muted tracking-widest mb-1">Email</span>
              <span className="flex items-center gap-2 text-sm font-bold text-brand-ink">
                <Mail size={14} className="text-brand-primary" /> {user.email}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-brand-muted tracking-widest mb-1">Location</span>
              <span className="flex items-center gap-2 text-sm font-bold text-brand-ink">
                <MapPin size={14} className="text-brand-primary" /> {user.address}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal Simulation */}
      <AnimatePresence>
        {showVerifyMock && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-ink/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 text-center space-y-6 overflow-hidden relative shadow-2xl"
            >
              <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto text-brand-primary">
                {isVerifying ? <Loader2 size={40} className="animate-spin" /> : <ShieldCheck size={40} />}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase">{t.aadhaarBioVerifier}</h3>
                <p className="text-sm text-brand-muted leading-relaxed">
                  {t.facialMatchDesc}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-brand-paper rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-brand-ink/5">
                   <div className="w-16 h-16 bg-brand-ink/10 rounded-full flex items-center justify-center">
                     <User size={32} className="text-brand-ink/40" />
                   </div>
                   <span className="text-[8px] font-bold uppercase opacity-40">{t.profilePhoto}</span>
                </div>
                <div className="aspect-square bg-brand-paper rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-brand-primary/20">
                   <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center">
                     <ShieldCheck size={32} className="text-brand-primary" />
                   </div>
                   <span className="text-[8px] font-bold uppercase text-brand-primary">{t.aadhaarRecord}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  disabled={isVerifying}
                  onClick={() => setShowVerifyMock(false)}
                  className="flex-1 py-4 bg-brand-paper rounded-xl font-bold text-xs uppercase tracking-widest text-brand-ink border border-brand-ink/5"
                >
                  {t.cancel}
                </button>
                <button 
                  disabled={isVerifying}
                  onClick={handleVerify}
                  className="flex-1 py-4 bg-brand-ink text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-brand-ink/20 disabled:opacity-50"
                >
                  {isVerifying ? (t.scanning || 'Scanning...') : (t.startMatching || 'Start Matching')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-ink/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-brand-ink/10"
            >
              <div className="p-6 border-b border-brand-ink/5 flex justify-between items-center bg-brand-paper">
                <h2 className="text-xl font-bold">{t.editProfile}</h2>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-brand-ink/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-40 ml-1">{t.fullName}</label>
                  <input 
                    type="text" 
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-brand-paper border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-brand-primary transition-all font-medium"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-40 ml-1">{t.phoneNumber}</label>
                    <input 
                      type="tel" 
                      value={formData.phone || ''}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-brand-paper border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-brand-primary transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-40 ml-1">{t.emailAddress}</label>
                    <input 
                      type="email" 
                      value={formData.email || ''}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-brand-paper border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-brand-primary transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-40 ml-1">{t.address}</label>
                  <textarea 
                    value={formData.address || ''}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-brand-paper border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-brand-primary transition-all font-medium min-h-[100px]"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-4 rounded-2xl font-bold bg-brand-ink/5 hover:bg-brand-ink/10 transition-all uppercase tracking-wider text-xs"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    disabled={isSaving}
                    onClick={async () => {
                      setIsSaving(true);
                      await onUpdate(formData);
                      setIsSaving(false);
                      setIsEditing(false);
                    }}
                    className="flex-1 py-4 rounded-2xl font-bold bg-brand-primary text-white flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all uppercase tracking-wider text-xs"
                  >
                    {isSaving ? "..." : <><Save size={16} /> {t.saveChanges}</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={`${stat.label}-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl card-shadow border border-brand-ink/5"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.color)}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest opacity-50 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Verification Card */}
      <section className="bg-white rounded-3xl p-8 card-shadow border border-brand-ink/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16" />
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Award className="text-brand-primary" size={24} /> {t.verificationQr}
        </h3>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="p-6 bg-[#FFFFFF] border-8 border-brand-paper rounded-3xl shadow-sm">
            <QRCodeCanvas 
              value={`${window.location.origin}/view/${user.setuId}`} 
              size={128}
              level="H"
              includeMargin={false}
              fgColor="#141414"
            />
          </div>
          <div className="flex-1 space-y-4">
            <p className="text-brand-ink/70 leading-relaxed">
              {t.qrCodeDesc}
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={downloadQR}
                className="flex items-center gap-2 px-6 py-3 border border-brand-ink/20 rounded-xl font-bold hover:bg-brand-paper transition-all"
              >
                <Download size={18} /> {t.downloadCode}
              </button>
              <button 
                onClick={shareProfile}
                className="flex items-center gap-2 px-6 py-3 border border-brand-ink/20 rounded-xl font-bold hover:bg-brand-paper transition-all"
              >
                <Share2 size={18} /> {t.shareProfile}
              </button>
              <button 
                onClick={() => onNavigate?.('labour-card')}
                className="flex items-center gap-2 px-6 py-3 bg-brand-ink text-white rounded-xl font-bold hover:bg-brand-primary transition-all shadow-lg"
              >
                <FileText size={18} /> {t.viewLabourCard}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

