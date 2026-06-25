import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, User, Phone, CheckCircle2, MapPin, Briefcase } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useFirebase } from '../hooks/useFirebase';

export default function CompleteProfile() {
  const { saveUserProfile, generateSetuId } = useFirebase();
  const storedRole = localStorage.getItem('selectedRole') as 'worker' | 'contractor' | 'organization';
  const role = storedRole || 'worker';
  const isContractor = role === 'contractor';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(auth.currentUser?.displayName || '');
  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'hi' | 'kn' | 'ta'>('hi');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !aadhaar || !phone) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    if (!/^\d{12}$/.test(aadhaar)) {
      setError('Aadhaar ID must be exactly 12 digits.');
      return;
    }

    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())) {
      setError('Invalid PAN card format.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (!auth.currentUser) return;
      
      const baseProfile = {
        uid: auth.currentUser.uid,
        name,
        email: auth.currentUser.email || '',
        phone,
        aadhaarMasked: `XXXX XXXX ${aadhaar.slice(-4)}`,
        aadhaarFull: aadhaar,
        pan: pan.toUpperCase(),
        photoUrl,
        address,
        preferredLanguage,
        role
      };

      let finalProfile: any = { ...baseProfile };

      if (role === 'worker') {
        finalProfile = {
          ...finalProfile,
          totalDaysWorked: 0,
          totalEarnings: 0,
          setuId: generateSetuId()
        };
      } else if (role === 'contractor') {
        finalProfile = {
          ...finalProfile,
          pradhanId: `SS-PR-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
        };
      } else if (role === 'organization') {
        finalProfile = {
          ...finalProfile,
          orgId: `SS-ORG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          shortlist: []
        };
      }
      
      await saveUserProfile(finalProfile, aadhaar);
    } catch (err: any) {
      console.error('Profile Saving Error:', err);
      let displayError = 'An error occurred during registration.';
      
      try {
        // Try to parse JSON from handleFirestoreError
        const parsed = JSON.parse(err.message);
        if (parsed.error) {
          displayError = `Profile Sync Failure: ${parsed.error}`;
        }
      } catch (e) {
        // Not JSON or standard error
        if (err.message && (err.message.includes('registered') || err.message.includes('already exists'))) {
          displayError = err.message;
        } else if (err.message) {
          displayError = err.message;
        }
      }
      
      setError(displayError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-paper flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2rem] shadow-xl border border-brand-ink/5 overflow-hidden"
      >
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-brand-primary/20">
            {isContractor ? <Briefcase size={32} /> : <User size={32} />}
          </div>
          <h1 className="font-display font-black text-2xl tracking-tight uppercase mb-2 text-brand-ink">
            {isContractor ? 'Contractor Setup' : 'Complete Your Profile'}
          </h1>
          <p className="text-sm text-brand-muted mb-8">
            {isContractor 
              ? 'Professional details to manage your crew and projects.' 
              : 'Just a few more details to get you started as a Worker.'}
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl border border-red-100 uppercase tracking-wider text-left">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-muted ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30" size={20} />
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="As per Government ID"
                  required
                  className="w-full bg-brand-paper border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary transition-all text-brand-ink placeholder:text-brand-muted/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-muted ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30" size={20} />
                <input 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  required
                  className="w-full bg-brand-paper border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary transition-all text-brand-ink placeholder:text-brand-muted/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-muted ml-1">Aadhaar Number</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30 font-bold text-xs">ID</div>
                <input 
                  type="text"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="12-digit Aadhaar number"
                  required
                  className="w-full bg-brand-paper border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary transition-all text-brand-ink placeholder:text-brand-muted/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-muted ml-1">PAN Card (Optional)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30 font-bold text-xs">PAN</div>
                <input 
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase().slice(0, 10))}
                  placeholder="ABCDE1234F"
                  className="w-full bg-brand-paper border-none rounded-2xl py-4 pl-14 pr-4 focus:ring-2 focus:ring-brand-primary transition-all text-brand-ink placeholder:text-brand-muted/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-muted ml-1">Profile Photo URL</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30 font-bold text-xs">URL</div>
                <input 
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Link to your profile photo"
                  className="w-full bg-brand-paper border-none rounded-2xl py-4 pl-14 pr-4 focus:ring-2 focus:ring-brand-primary transition-all text-brand-ink placeholder:text-brand-muted/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-muted ml-1">Current Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30" size={20} />
                <input 
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Village, District, State"
                  required
                  className="w-full bg-brand-paper border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary transition-all text-brand-ink placeholder:text-brand-muted/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-muted ml-1">Preferred Language</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'en', label: 'English' },
                  { id: 'hi', label: 'हिंदी (Hindi)' },
                  { id: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
                  { id: 'ta', label: 'தமிழ் (Tamil)' },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setPreferredLanguage(lang.id as any)}
                    className={`p-3 rounded-xl text-sm font-bold border-2 transition-all ${
                      preferredLanguage === lang.id 
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' 
                        : 'border-brand-paper bg-brand-paper text-brand-muted hover:border-brand-muted/20'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50 mt-6"
            >
              {isLoading ? "Saving..." : (
                <>
                  Start Now
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <button 
              type="button"
              onClick={() => auth.signOut()}
              className="w-full text-brand-muted py-2 text-xs font-bold uppercase tracking-widest hover:text-red-500 transition-colors"
            >
              Cancel & Logout
            </button>
          </form>
        </div>

        <div className="bg-brand-paper/50 p-6 flex items-center gap-3 border-t border-brand-ink/5">
          <CheckCircle2 size={24} className="text-brand-primary" />
          <p className="text-[10px] uppercase font-bold tracking-wider text-brand-muted leading-tight text-left">
            Your data is secured with AES-256 encryption & compliant with Indian digital norms.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
