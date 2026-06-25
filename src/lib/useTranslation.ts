import { translations } from './translations';
import { UserProfile } from '../types';

export function useTranslation(profile: UserProfile | null) {
  const lang = profile?.preferredLanguage || 'hi';
  const t = translations[lang] || translations['en'];
  
  return { t, lang };
}
