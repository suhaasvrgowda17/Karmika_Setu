import { useState, useEffect } from 'react';
import { Globe, Bell, Shield, Eye, Smartphone, Save } from 'lucide-react';
import { UserProfile } from '../../types';
import { useFirebase } from '../../hooks/useFirebase';

interface SettingsProps {
  profile: UserProfile | null;
  t: any;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onLanguageChange?: (lang: string) => void;
}

export default function Settings({ profile, t, theme, onThemeToggle, onLanguageChange }: SettingsProps) {
  const { updateLanguage, updateProfile } = useFirebase();
  const [language, setLanguage] = useState(profile?.preferredLanguage || 'hi');
  const [notifications, setNotifications] = useState(profile?.notificationsEnabled !== false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile && !isSaving) {
      if (profile.preferredLanguage) setLanguage(profile.preferredLanguage);
      if (profile.notificationsEnabled !== undefined) setNotifications(profile.notificationsEnabled);
    }
  }, [profile, isSaving]);

  const handleLanguageChange = async (newLang: string) => {
    setLanguage(newLang);
    if (onLanguageChange) onLanguageChange(newLang);
    setIsSaving(true);
    try {
      await updateLanguage(newLang);
    } catch (err) {
      console.error("Failed to update language:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ notificationsEnabled: notifications });
      alert(t.prefsUpdated || "Preferences Updated!");
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl font-bold mb-2">{t.settings}</h1>
        <p className="text-brand-ink/60">{t.languageDesc}</p>
      </header>

      <div className="max-w-2xl space-y-6">
        {/* Appearance */}
        <div className="bg-white rounded-3xl p-8 card-shadow border border-brand-ink/5 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-paper rounded-2xl text-brand-primary">
              <Eye size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-brand-ink">{t.appearance || "Appearance"}</h3>
              <p className="text-sm text-brand-muted">{t.appearanceDesc || "Choose how the app looks for you"}</p>
            </div>
          </div>
          
          <div className="flex bg-brand-paper p-1 rounded-2xl">
            <button 
              onClick={() => theme !== 'light' && onThemeToggle()}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${theme === 'light' ? 'bg-white shadow-sm text-brand-ink' : 'text-brand-muted hover:text-brand-ink'}`}
            >
              <Smartphone size={18} /> {t.lightMode || "Light Mode"}
            </button>
            <button 
              onClick={() => theme !== 'dark' && onThemeToggle()}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${theme === 'dark' ? 'bg-white shadow-sm text-brand-ink' : 'text-brand-muted hover:text-brand-ink'}`}
            >
              <Smartphone size={18} className="fill-current" /> {t.darkMode || "Dark Mode"}
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-white rounded-3xl p-8 card-shadow border border-brand-ink/5 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-paper rounded-2xl text-brand-primary">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">{t.language}</h3>
              <p className="text-sm text-brand-ink/50">{t.languageDesc}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: 'en', label: 'English', native: 'English' },
              { id: 'hi', label: 'Hindi', native: 'हिन्दी' },
              { id: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
              { id: 'ta', label: 'Tamil', native: 'தமிழ்' },
              { id: 'te', label: 'Telugu', native: 'తెలుగు' },
              { id: 'mr', label: 'Marathi', native: 'मराठी' },
              { id: 'bn', label: 'Bengali', native: 'বাংলা' },
            ].map((lang) => (
              <button
                key={lang.id}
                disabled={isSaving}
                onClick={() => handleLanguageChange(lang.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                  language === lang.id 
                    ? 'border-brand-primary bg-brand-primary/5' 
                    : 'border-brand-ink/5 bg-brand-paper/30 hover:border-brand-ink/10'
                } disabled:opacity-50`}
              >
                <p className="font-bold text-sm">{lang.label}</p>
                <p className="text-[10px] opacity-50">{lang.native}</p>
                {language === lang.id && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-3xl p-8 card-shadow border border-brand-ink/5 space-y-6">
          <h3 className="font-bold text-xl mb-4">{t.notifPrivacy || "Notifications & Privacy"}</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-brand-paper/30 rounded-2xl">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-brand-ink/40" />
                <div>
                  <p className="font-bold text-sm">{t.pushNotifs || "Push Notifications"}</p>
                  <p className="text-[10px] opacity-50 font-medium">{t.notifDesc || "Payment reminders & work updates"}</p>
                </div>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-green-500' : 'bg-brand-ink/20'}`}
              >
                <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${notifications ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-brand-paper/30 rounded-2xl opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <Shield size={20} />
                <div>
                  <p className="font-bold text-sm">{t.biometricLock || "Bio-metric Lock"}</p>
                  <p className="text-[10px] uppercase font-bold">{t.proFeature || "Pro Feature"}</p>
                </div>
              </div>
              <div className="text-xs font-bold text-brand-primary">{t.upgrade || "Upgrade"}</div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSaveAll}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-3 bg-brand-primary text-white p-4 rounded-2xl font-black shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {isSaving ? <div className="w-6 h-6 border-2 border-white/30 border-t-white animate-spin rounded-full" /> : <Save size={24} />}
          {isSaving ? (t.saving || "SAVING...") : t.saveChanges.toUpperCase()}
        </button>

        <div className="text-center pt-8 space-y-2">
          <p className="text-xs opacity-30 font-bold uppercase tracking-[0.2em]">App Version 1.0.4 - Beta</p>
          <div className="flex justify-center gap-4 text-xs font-bold opacity-40">
            <a href="#" className="hover:text-brand-primary">Terms of Use</a>
            <a href="#" className="hover:text-brand-primary">Privacy Policy</a>
            <a href="#" className="hover:text-brand-primary">Help Center</a>
          </div>
        </div>
      </div>
    </div>
  );
}
