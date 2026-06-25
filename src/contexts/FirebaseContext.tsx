import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  doc, 
  onSnapshot,
  collection,
  query,
  orderBy,
  where,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, WorkEntry, OrganizationProfile, ContractorProfile, VerificationRequest, HireRequest, JobListing } from '../types';

interface FirebaseContextType {
  userProfile: UserProfile | OrganizationProfile | ContractorProfile | null;
  workEntries: WorkEntry[];
  verificationRequests: VerificationRequest[];
  hireRequests: HireRequest[];
  jobListings: JobListing[];
  stats: { totalWorkers: number };
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | OrganizationProfile | ContractorProfile | null>(null);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [hireRequests, setHireRequests] = useState<HireRequest[]>([]);
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [stats, setStats] = useState({ totalWorkers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeStats = () => {};
    let unsubscribeProfile = () => {};
    let unsubscribeEntries = () => {};
    let unsubscribeRequests = () => {};
    let unsubscribeHires = () => {};

    const cleanup = () => {
      unsubscribeStats();
      unsubscribeProfile();
      unsubscribeEntries();
      unsubscribeRequests();
      unsubscribeHires();
    };

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      cleanup();
      
      const isDemoMode = localStorage.getItem('karmik_demo_mode') === 'true';

      if (user || isDemoMode) {
        setLoading(true);
        
        if (isDemoMode && !user) {
          // Provide mock data for demo mode
          const role = (localStorage.getItem('selectedRole') as any) || 'worker';
          setUserProfile({
            uid: 'demo-user',
            name: 'Demo Principal',
            email: 'demo@shramiksetu.org',
            phone: '+91 9876543210',
            address: 'New Delhi, India',
            role: role as any,
            setuId: 'SS-DEMO-2024',
            totalDaysWorked: 45,
            totalEarnings: 22500,
            preferredLanguage: 'en',
            status: 'available'
          } as any);
          setWorkEntries([
            { id: 'w1', userId: 'demo-user', date: '2024-05-15', category: 'Construction' as any, workType: 'Masonry', location: 'Delhi', hoursWorked: 8, paymentReceived: 600, paymentStatus: 'Paid', createdAt: Date.now() - 86400000, status: 'verified' }
          ]);
          setStats({ totalWorkers: 1240 });
          setLoading(false);
          return;
        }

        // Stats listener
        const statsRef = doc(db, 'system', 'stats');
        unsubscribeStats = onSnapshot(statsRef, (snapshot) => {
          if (snapshot.exists()) {
            setStats(snapshot.data() as any);
          }
        }, (error) => {
          console.warn('Stats listen error:', error);
        });

        // Profile listener
        const userDocRef = doc(db, 'users', user.uid);
        unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserProfile(snapshot.data() as any);
          } else {
            setUserProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.warn('Profile listen error:', error);
          setLoading(false);
        });

        // Entries listener
        const entriesRef = collection(db, `users/${user.uid}/workEntries`);
        const q = query(entriesRef, orderBy('createdAt', 'desc'));
        unsubscribeEntries = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(d => d.data() as WorkEntry);
          setWorkEntries(data);
          setLoading(false);
        }, (error) => {
          console.warn('Entries listen error:', error);
          setLoading(false);
        });

        // Verifications listener
        const verificationsRef = collection(db, 'verifications');
        let requestsQuery;
        
        // This is a bit tricky: we need to know the role to decide the query.
        // But the profile is being loaded in parallel.
        // We can just listen to both or wait for profile.
        // For now, let's query where contractorId == uid OR workerId == uid
        // However, a simple or query requires multiple queries or a combined index.
        // We'll listen for contractorId == uid if we know the user is a contractor.
        // To keep it simple, we'll wait for the profile to decide the primary query.
        
        // Actually, we can use a simpler approach: observe the profile changes.
      } else {
        setUserProfile(null);
        setWorkEntries([]);
        setStats({ totalWorkers: 0 });
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (!auth.currentUser || !userProfile) {
      setVerificationRequests([]);
      return;
    }

    const { uid } = auth.currentUser;
    const { role, setuId } = userProfile;

    // Hire Requests sync
    const hireRef = collection(db, 'hireRequests');
    let hireQ;
    if (role === 'worker') {
      hireQ = query(hireRef, where('workerId', '==', uid));
    } else {
      hireQ = query(hireRef, where('contractorId', '==', uid));
    }

    const unsubscribeHire = onSnapshot(hireQ, (snap) => {
      const data = snap.docs.map(d => d.data() as HireRequest);
      setHireRequests(data.sort((a, b) => b.createdAt - a.createdAt));
    });

    // Job Listings listener - everyone can see listings
    const jobsRef = collection(db, 'jobListings');
    const jobsQ = query(jobsRef, where('status', '==', 'active'), orderBy('createdAt', 'desc'));
    const unsubscribeJobs = onSnapshot(jobsQ, (snap) => {
      const data = snap.docs.map(d => d.data() as JobListing);
      setJobListings(data);
    }, (err) => {
      console.warn('Jobs listen error:', err);
      // Fallback for missing index: if sorting fails, just get without sort
      onSnapshot(query(jobsRef, where('status', '==', 'active')), (s) => {
        const d = s.docs.map(doc => doc.data() as JobListing);
        setJobListings(d.sort((a, b) => b.createdAt - a.createdAt));
      });
    });

    // Self-healing: Ensure setuId is registered in uniques
    if (setuId) {
      const setuRef = doc(db, `uniques/setuIds/entries/${setuId}`);
      getDoc(setuRef).then(snap => {
        if (!snap.exists()) {
          setDoc(setuRef, { userId: uid }).catch(e => console.warn('SetuId register error:', e));
        }
      });
    }

    const verificationsRef = collection(db, 'verifications');
    let q;

    if (role === 'contractor') {
      // Use single where to avoid composite index requirement
      q = query(verificationsRef, where('contractorId', '==', uid));
    } else if (role === 'worker') {
      q = query(verificationsRef, where('workerId', '==', uid));
    } else {
      setVerificationRequests([]);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(d => d.data() as VerificationRequest);
      
      // Filter pending only for contractors in memory
      if (role === 'contractor') {
        data = data.filter(d => d.status === 'pending');
      }
      
      setVerificationRequests(data.sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => {
      console.warn('Verifications listen error:', error);
    });

    return () => {
      unsubscribeHire();
      unsubscribeJobs();
      unsubscribe();
    };
  }, [userProfile?.role]);

  return (
    <FirebaseContext.Provider value={{ userProfile, workEntries, verificationRequests, hireRequests, jobListings, stats, loading }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebaseData() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebaseData must be used within a FirebaseProvider');
  }
  return context;
}
