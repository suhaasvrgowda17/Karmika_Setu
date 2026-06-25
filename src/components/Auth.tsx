import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, ArrowRight, CheckCircle2, User, Phone, Moon, Sun, Fingerprint } from 'lucide-react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import { useFirebase } from '../hooks/useFirebase';

import { UserRole } from '../types';

interface AuthProps {
  onLogin: () => void;
  role: UserRole;
  onBack: () => void;
  t: any;
  lang: string;
  onLanguageChange: (lang: string) => void;
}

type AuthMode = 'login' | 'register';

export default function Auth({ onLogin, role, onBack, t, lang, onLanguageChange }: AuthProps) {
  const { saveUserProfile, generateSetuId, getUserProfile } = useFirebase();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [phone, setPhone] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
  };

  const isWorker = role === 'worker';
  const isContractor = role === 'contractor';
  const isOrg = role === 'organization';

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      localStorage.setItem('selectedRole', role);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if profile exists
      const profile = await getUserProfile(user.uid);
      if (profile && profile.role !== role) {
        await signOut(auth);
        setError(`This account is registered as a ${profile.role}. Please use the correct portal.`);
        setIsLoading(false);
        return;
      }
      onLogin();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      const errorCode = err.code || '';
      const errorMessage = err.message || '';
      
      if (errorCode === 'auth/popup-blocked' || errorMessage.includes('popup-blocked')) {
        setError('Sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else if (errorCode === 'auth/popup-closed-by-user' || errorMessage.includes('popup-closed-by-user')) {
        setError('Sign-in window was closed before completion.');
      } else if (errorCode === 'auth/unauthorized-domain' || errorMessage.includes('unauthorized-domain')) {
        setError('This domain is not authorized for Firebase Authentication. Please check your Firebase console.');
      } else if (errorCode === 'auth/network-request-failed' || errorMessage.includes('network-request-failed') || errorCode === 'auth/argument-error' || errorMessage.includes('argument-error')) {
        const isInIframe = window.self !== window.top;
        if (isInIframe) {
          setError('Authentication / Network request failed. This often happens in the preview window due to browser sandbox security settings. Please try opening the app in a NEW TAB using the button in the top right.');
        } else {
          setError('Authentication / Network request failed. Please check your internet connection or disable ad-blockers/VPNs.');
        }
      } else {
        setError(`Google Sign-In failed: ${errorMessage || 'Please try again.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }
    } else {
      if (!email || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const userEmail = email.toLowerCase().trim();
    
    try {
      if (mode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
        // After login, we must check if the user's role matches the portal they are trying to access
        const profile = await getUserProfile(userCredential.user.uid);
        if (profile && profile.role !== role) {
          await signOut(auth);
          setError(`This account is registered as a ${profile.role}. Please use the correct portal.`);
          setIsLoading(false);
          return;
        }
        localStorage.setItem('selectedRole', role);
        onLogin();
      } else {
        await createUserWithEmailAndPassword(auth, userEmail, password);
        localStorage.setItem('selectedRole', role);
        onLogin();
      }
    } catch (err: any) {
      console.error('Auth Error Details:', err);
      const errorCode = err.code || '';
      const errorMessage = err.message || '';
      
      // Detailed error logging for debugging
      if (err.name === 'FirebaseError') {
        console.warn(`Firebase Auth Error [${errorCode}]: ${errorMessage}`);
      }

      // Map Firebase error codes to user-friendly messages
      if (errorCode === 'auth/email-already-in-use' || errorMessage.includes('email-already-in-use') || errorMessage.includes('already registered')) {
        setError('Account already exists with this email. Please Login.');
        if (mode === 'register') setMode('login');
      } else if (errorCode === 'auth/invalid-email' || errorMessage.includes('invalid-email')) {
        setError('The email address is not valid. Please check and try again.');
      } else if (
        errorCode === 'auth/invalid-credential' || 
        errorCode === 'auth/wrong-password' || 
        errorCode === 'auth/user-not-found' || 
        errorMessage.includes('invalid-credential') ||
        errorMessage.includes('user-not-found')
      ) {
        if (mode === 'login') {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else {
          setError('This email may already be associated with an account. Try logging in instead.');
        }
      } else if (errorCode === 'auth/weak-password' || errorMessage.includes('weak-password')) {
        setError('Password should be at least 6 characters.');
      } else if (errorCode === 'auth/too-many-requests' || errorMessage.includes('too-many-requests')) {
        setError('Too many failed attempts. Please try again later.');
      } else if (errorCode === 'auth/popup-blocked' || errorMessage.includes('popup-blocked')) {
        setError('Sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else if (errorCode === 'auth/popup-closed-by-user' || errorMessage.includes('popup-closed-by-user')) {
        setError('Sign-in window was closed before completion.');
      } else if (errorCode === 'auth/unauthorized-domain' || errorMessage.includes('unauthorized-domain')) {
        setError('This domain is not authorized for Firebase Authentication. Please check your Firebase console.');
      } else if (errorCode === 'auth/network-request-failed' || errorMessage.includes('network-request-failed')) {
        const isInIframe = window.self !== window.top;
        if (isInIframe) {
          setError('Network request failed. This often happens in the preview window due to browser security settings. Please try opening the app in a NEW TAB using the button in the top right.');
        } else {
          setError('Network request failed. Please check your internet connection or disable ad-blockers/VPNs that might be blocking Google services.');
        }
      } else if (errorMessage.includes('registered') || errorMessage.includes('already exists')) {
        // Handle custom transaction errors from saveUserProfile
        setError(errorMessage);
      } else {
        setError(`Authentication failed: ${errorMessage || 'Unknown error'}. Please check your connection.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    // This is a "Bypass" for development environments where Firebase might be blocked
    localStorage.setItem('karmik_demo_mode', 'true');
    localStorage.setItem('selectedRole', role);
    onLogin();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please enter your email to reset password');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, you'd use Firebase: sendPasswordResetEmail(auth, resetEmail)
      // For this prototype, we simulate a success message
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResetSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-paper flex items-center justify-center p-4">
      <AnimatePresence>
        {showForgotPassword ? (
          <motion.div 
            key="forgot-password"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md w-full bg-white rounded-[2rem] shadow-xl border border-brand-ink/5 p-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto text-brand-primary mb-4">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-brand-ink">{t.resetPassword}</h2>
              <p className="text-sm text-brand-muted mt-2 px-4">
                {resetSuccess 
                  ? t.checkInbox
                  : t.enterEmailRecovery}
              </p>
            </div>

            {resetSuccess ? (
              <button 
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetSuccess(false);
                  setResetEmail('');
                }}
                className="w-full bg-brand-ink text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                {t.backToLogin}
              </button>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
                    <input 
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="w-full bg-brand-paper border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary transition-all text-brand-ink"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all font-display uppercase tracking-widest text-xs"
                  >
                    {isLoading ? t.processing : t.sendResetLink || "Send Reset Link"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full text-brand-muted font-bold text-xs uppercase tracking-widest py-2"
                  >
                    {t.cancel}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="auth-main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white rounded-[2rem] shadow-xl border border-brand-ink/5 overflow-hidden"
          >
            <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand-primary/20">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h1 className="font-display font-black text-2xl tracking-tight leading-none uppercase text-brand-ink">Karmik Setu</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-brand-muted">
                {isWorker ? t.workerRole : isContractor ? t.contractorRole : t.orgRole}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-brand-paper hover:bg-brand-ink hover:text-white transition-all text-brand-muted"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button 
              onClick={onBack}
              className="text-[10px] font-black uppercase tracking-widest bg-brand-paper px-3 py-2 rounded-lg hover:bg-brand-ink hover:text-white transition-all text-brand-ink"
            >
              {t.back}
            </button>
          </div>
        </div>

        <div className="flex bg-brand-paper p-1 rounded-2xl mb-8">
          <button 
            onClick={() => { setMode('login'); setError(null); }}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl font-bold transition-all text-sm uppercase tracking-wider",
              mode === 'login' ? "bg-white text-brand-ink shadow-sm" : "text-brand-muted"
            )}
          >
            {t.login}
          </button>
          <button 
            onClick={() => { setMode('register'); setError(null); }}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl font-bold transition-all text-sm uppercase tracking-wider",
              mode === 'register' ? "bg-white text-brand-ink shadow-sm" : "text-brand-muted"
            )}
          >
            {t.register}
          </button>
        </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 uppercase tracking-tight leading-relaxed">
              <div className="mb-2 italic">{error}</div>
              {(error.includes('NEW TAB') || error.includes('network-request-failed')) && (
                <div className="space-y-2 mt-2">
                  <button 
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="w-full py-2 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all shadow-md"
                  >
                    Open in New Tab to Fix
                  </button>
                  <button 
                    onClick={handleDemoAccess}
                    className="w-full py-2 bg-white text-brand-ink border border-brand-ink/20 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-paper transition-all"
                  >
                    Bypass Login (Demo Mode)
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-muted ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-brand-paper border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary transition-all text-brand-ink placeholder:text-brand-muted/70"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-muted ml-1">{t.password || 'Password'}</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-brand-paper border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary transition-all text-brand-ink placeholder:text-brand-muted/70"
                />
              </div>
              {mode === 'login' && (
                <div className="flex justify-end pt-1">
                  <button 
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline"
                  >
                    {t.forgotPassword}
                  </button>
                </div>
              )}
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-muted ml-1">Confirm Password</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-brand-paper border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary transition-all text-brand-ink placeholder:text-brand-muted/70"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50"
            >
              {isLoading ? t.processing : (
                <>
                  {mode === 'login' ? t.login : t.register}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-ink/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                <span className="bg-white px-4 text-brand-muted">{t.orContinueWith}</span>
              </div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white border-2 border-brand-ink/5 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-paper transition-all disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              <span className="text-xs uppercase tracking-widest font-black">{t.signInWithGoogle}</span>
            </button>
          </div>
        </div>

        <div className="bg-brand-paper/50 p-6 flex items-center gap-3 border-t border-brand-ink/5">
          <CheckCircle2 size={24} className="text-brand-primary" />
          <p className="text-[10px] uppercase font-bold tracking-wider text-brand-muted leading-tight">
            {t.compliantText}
          </p>
        </div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
