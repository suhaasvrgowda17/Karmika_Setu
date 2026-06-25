import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, User, Phone, MapPin, Briefcase, CheckCircle2, ArrowRight } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useFirebase } from '../hooks/useFirebase';

interface CompleteOrgProfileProps {
  roleOverride?: 'contractor';
}

export default function CompleteOrgProfile({ roleOverride }: CompleteOrgProfileProps) {
  const { saveUserProfile } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [orgType, setOrgType] = useState(roleOverride === 'contractor' ? 'Contractor' : 'Bank');
  const [address, setAddress] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [phone, setPhone] = useState('');

  const isContractor = roleOverride === 'contractor';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !contactPerson || !address || (isContractor && (!aadhaar || !phone))) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (!auth.currentUser) return;
      
      if (isContractor) {
        await saveUserProfile({
          uid: auth.currentUser.uid,
          name: contactPerson,
          companyName: orgName,
          email: auth.currentUser.email || '',
          phone,
          aadhaarMasked: `XXXX XXXX ${aadhaar.slice(-4)}`,
          address,
          role: 'contractor',
          pradhanId: 'SS-PR-' + Math.random().toString(36).substring(2, 6).toUpperCase()
        }, aadhaar);
      } else {
        await saveUserProfile({
          uid: auth.currentUser.uid,
          orgName,
          contactPerson,
          email: auth.currentUser.email || '',
          orgType,
          address,
          role: 'organization',
          setuId: 'SS-ORG-' + Math.random().toString(36).substring(2, 6).toUpperCase()
        });
      }
    } catch (err: any) {
      console.error('Org Profile Saving Error:', err);
      let displayError = 'An error occurred while saving your profile.';
      
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error) {
          displayError = `Profile Sync Failure: ${parsed.error}`;
        }
      } catch (e) {
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
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full bg-white rounded-[2rem] shadow-xl border border-[#141414]/5 overflow-hidden"
      >
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-[#141414] rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-black/20">
            <Building2 size={32} />
          </div>
          <h1 className="font-display font-black text-2xl tracking-tight uppercase mb-2">
            {isContractor ? 'Contractor Setup' : 'Organization Setup'}
          </h1>
          <p className="text-sm text-[#141414]/60 mb-8">Professional details to help verify your identity on Karmik Setu.</p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl border border-red-100 uppercase tracking-wider text-left">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">
                  {isContractor ? 'Business / Company' : 'Organization Name'}
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/30" size={18} />
                  <input 
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={isContractor ? "Professional Name" : "Entity legal name"}
                    required
                    className="w-full bg-[#F5F5F0] border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#141414] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Organization Type</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/30" size={18} />
                  <select 
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="w-full bg-[#F5F5F0] border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#141414] transition-all appearance-none text-sm font-bold"
                  >
                    {!isContractor && (
                      <>
                        <option value="Bank">Bank / Finance</option>
                        <option value="NGO">NGO / Social Org</option>
                        <option value="Government">Government / Public Body</option>
                        <option value="Corporate">Corporate / Philanthropy</option>
                      </>
                    )}
                    {isContractor && <option value="Contractor">Individual Contractor</option>}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Contact Person</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/30" size={18} />
                <input 
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Full name of representative"
                  required
                  className="w-full bg-[#F5F5F0] border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#141414] transition-all"
                />
              </div>
            </div>

            {isContractor && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/30" size={18} />
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile"
                      required
                      className="w-full bg-[#F5F5F0] border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#141414] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Aadhaar ID</label>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/30" size={18} />
                    <input 
                      type="text"
                      value={aadhaar}
                      onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      placeholder="12-digit Aadhaar"
                      required
                      className="w-full bg-[#F5F5F0] border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#141414] transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Office Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-[#141414]/30" size={18} />
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Complete registered address"
                  required
                  rows={3}
                  className="w-full bg-[#F5F5F0] border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#141414] transition-all resize-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#141414] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/20 disabled:opacity-50 mt-6"
            >
              {isLoading ? "Saving..." : (
                <>
                  Complete Setup
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <button 
              type="button"
              onClick={() => auth.signOut()}
              className="w-full text-[#141414]/40 py-2 text-xs font-bold uppercase tracking-widest hover:text-red-500 transition-colors"
            >
              Cancel & Logout
            </button>
          </form>
        </div>

        <div className="bg-[#F5F5F0]/50 p-6 flex items-center gap-3 border-t border-[#141414]/5">
          <CheckCircle2 size={24} className="text-[#141414]" />
          <p className="text-[10px] uppercase font-bold tracking-wider opacity-60 leading-tight text-left">
            Organization accounts are subjected to KYC verification before accessing worker data.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
