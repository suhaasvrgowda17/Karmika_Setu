import { useState } from 'react';
import { 
  doc, 
  getDoc,
  setDoc, 
  updateDoc,
  runTransaction,
  increment,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, WorkEntry, OrganizationProfile, ContractorProfile, JobListing } from '../types';
import { useFirebaseData } from '../contexts/FirebaseContext';

export function useFirebase() {
  const { userProfile, workEntries, verificationRequests, hireRequests, jobListings, stats, loading } = useFirebaseData();
  const [isActionLoading, setIsActionLoading] = useState(false);

  const isDemoMode = localStorage.getItem('karmik_demo_mode') === 'true';

  const generateSetuId = () => {
    return `SS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  };

  const saveUserProfile = async (profile: UserProfile | OrganizationProfile | ContractorProfile, rawAadhaar?: string) => {
    if (!auth.currentUser && !isDemoMode) return;
    if (isDemoMode) {
      setIsActionLoading(true);
      setTimeout(() => {
        setIsActionLoading(false);
      }, 500);
      return;
    }
    const normalizedEmail = profile.email.toLowerCase().trim();
    const path = `users/${auth.currentUser.uid}`;
    setIsActionLoading(true);
    try {
      await runTransaction(db, async (transaction) => {
        // --- PHASE 1: ALL READS ---
        
        // 1. Check for email uniqueness
        const emailRef = doc(db, `uniques/emails/entries/${normalizedEmail}`);
        const emailDoc = await transaction.get(emailRef);
        if (emailDoc.exists() && (emailDoc.data() as any)?.userId !== auth.currentUser?.uid) {
          throw new Error('Email already registered');
        }

        // 2. Check for pradhanId uniqueness
        let pradhanRef = null;
        if (profile.role === 'contractor' && 'pradhanId' in profile) {
          pradhanRef = doc(db, `uniques/pradhanIds/entries/${profile.pradhanId}`);
          const pradhanDoc = await transaction.get(pradhanRef);
          if (pradhanDoc.exists() && (pradhanDoc.data() as any)?.userId !== auth.currentUser?.uid) {
            throw new Error('Pradhan ID collision, please try again');
          }
        }
        
        // 3. Check for setuId uniqueness (for non-contractors)
        let setuRef = null;
        if (profile.role !== 'contractor' && 'setuId' in profile) {
          setuRef = doc(db, `uniques/setuIds/entries/${profile.setuId}`);
          const setuDoc = await transaction.get(setuRef);
          if (setuDoc.exists() && (setuDoc.data() as any)?.userId !== auth.currentUser?.uid) {
            throw new Error('SETU-ID collision, please try again');
          }
        }

        // 4. Check for phone uniqueness if worker or contractor
        let phoneRef = null;
        let aadhaarRef = null;
        if (profile.role === 'worker' || profile.role === 'contractor') {
          const phoneVal = (profile as any).phone;
          if (phoneVal && phoneVal.trim()) {
            phoneRef = doc(db, `uniques/phones/entries/${phoneVal.trim()}`);
            const phoneDoc = await transaction.get(phoneRef);
            if (phoneDoc.exists() && (phoneDoc.data() as any)?.userId !== auth.currentUser?.uid) {
              throw new Error('Phone number already registered');
            }
          }

          if (rawAadhaar) {
            aadhaarRef = doc(db, `uniques/aadhaars/entries/${rawAadhaar}`);
            const aadhaarDoc = await transaction.get(aadhaarRef);
            if (aadhaarDoc.exists() && (aadhaarDoc.data() as any)?.userId !== auth.currentUser?.uid) {
              throw new Error('Aadhaar number already registered');
            }
          }
        }

        // --- PHASE 2: ALL WRITES ---

        // Register Pradhan ID
        if (pradhanRef) {
          transaction.set(pradhanRef, { userId: auth.currentUser?.uid });
        }
        
        // Register SETU-ID
        if (setuRef) {
          transaction.set(setuRef, { userId: auth.currentUser?.uid });
        }

        // Register Phone & Aadhaar
        if (phoneRef) {
          transaction.set(phoneRef, { userId: auth.currentUser?.uid });
        }
        if (aadhaarRef) {
          transaction.set(aadhaarRef, { userId: auth.currentUser?.uid });
        }

        // Register Email & Profile
        transaction.set(emailRef, { userId: auth.currentUser?.uid });
        transaction.set(doc(db, path), { ...profile, email: normalizedEmail });
        
        // System stats
        if (profile.role === 'worker') {
          const statsRef = doc(db, 'system', 'stats');
          transaction.set(statsRef, {
            totalWorkers: increment(1)
          }, { merge: true });
        }
      });
    } catch (error: any) {
      if (error.message && (error.message.includes('registered') || error.message.includes('already exists'))) {
        throw error;
      }
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getUidByPradhanId = async (pradhanId: string) => {
    const pradhanRef = doc(db, `uniques/pradhanIds/entries/${pradhanId}`);
    const snap = await getDoc(pradhanRef);
    return snap.exists() ? snap.data().userId as string : null;
  };

  const getUidBySetuId = async (setuId: string) => {
    const setuRef = doc(db, `uniques/setuIds/entries/${setuId}`);
    const snap = await getDoc(setuRef);
    return snap.exists() ? snap.data().userId as string : null;
  };

  const addWorkEntry = async (entry: Omit<WorkEntry, 'id' | 'userId' | 'createdAt'>) => {
    if (!auth.currentUser) return;
    
    setIsActionLoading(true);
    let path = `users/${auth.currentUser.uid}/workEntries`;
    try {
      let resolvedContractorId = entry.contractorId;
      
      // If the provided contractorId looks like a Pradhan ID (starts with SS-PR-), resolve it
      if (entry.contractorId?.startsWith('SS-PR-')) {
        resolvedContractorId = await getUidByPradhanId(entry.contractorId) || '';
      } else if (entry.contractorId?.startsWith('SS-')) {
        resolvedContractorId = await getUidBySetuId(entry.contractorId) || '';
      }

      if (!resolvedContractorId) {
        throw new Error('Valid Pradhan ID or Setu ID is required for verification.');
      }

      const entryId = crypto.randomUUID();
      path = `users/${auth.currentUser.uid}/workEntries/${entryId}`;
      
      // Default status: if resolvedContractorId exists, it's pending. Otherwise, it's verified (self-attested).
      const status = resolvedContractorId ? 'pending' : 'verified';
      
      const newEntry: WorkEntry = {
        ...entry,
        contractorId: resolvedContractorId,
        id: entryId,
        userId: auth.currentUser.uid,
        createdAt: Date.now(),
        status
      };
      
      await runTransaction(db, async (transaction) => {
        transaction.set(doc(db, path), newEntry);
        
        // If we have a resolvedContractorId, create a verification request
        if (resolvedContractorId) {
          const verificationId = crypto.randomUUID();
          const verificationRef = doc(db, 'verifications', verificationId);
          transaction.set(verificationRef, {
            id: verificationId,
            workerId: auth.currentUser?.uid,
            workerName: userProfile?.name || 'Anonymous Worker',
            entryId: entryId,
            date: entry.date,
            workType: entry.workType,
            hours: entry.hoursWorked,
            contractorId: resolvedContractorId,
            status: 'pending',
            createdAt: Date.now()
          });
        } else {
          // Update profile stats immediately only if self-verified
          if (userProfile && userProfile.role === 'worker') {
            const userRef = doc(db, 'users', auth.currentUser?.uid || '');
            transaction.update(userRef, {
              totalDaysWorked: increment(1),
              totalEarnings: increment(entry.paymentReceived)
            });
          }
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsActionLoading(false);
    }
  };

  const respondToVerification = async (verificationId: string, status: 'verified' | 'rejected') => {
    if (!auth.currentUser) return;
    setIsActionLoading(true);
    try {
      await runTransaction(db, async (transaction) => {
        // --- PHASE 1: ALL READS ---
        const verifyRef = doc(db, 'verifications', verificationId);
        const verifySnap = await transaction.get(verifyRef);
        
        if (!verifySnap.exists()) throw new Error('Verification request not found');
        const data = verifySnap.data();
        
        const entryRef = doc(db, `users/${data.workerId}/workEntries/${data.entryId}`);
        const entrySnap = await transaction.get(entryRef);
        if (!entrySnap.exists()) throw new Error('Original work entry not found');
        const entryData = entrySnap.data() as WorkEntry;

        const workerRef = doc(db, 'users', data.workerId);
        const workerSnap = await transaction.get(workerRef);
        
        // --- PHASE 2: ALL WRITES ---
        
        // 1. Update verification status
        transaction.update(verifyRef, { status });
        
        // 2. Update the original work entry
        transaction.update(entryRef, { status });
        
        // 3. If verified, update the worker's stats
        if (status === 'verified' && workerSnap.exists()) {
          const earnings = Number(entryData.paymentReceived) || 0;
          transaction.update(workerRef, {
            totalDaysWorked: increment(1),
            totalEarnings: increment(earnings)
          });
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `verifications/${verificationId}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const updateLanguage = async (language: string) => {
    if (!auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}`;
    
    try {
      await updateDoc(doc(db, path), {
        preferredLanguage: language
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile | OrganizationProfile | ContractorProfile>) => {
    if (!auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}`;
    
    try {
      await updateDoc(doc(db, path), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const toggleShortlist = async (workerSetuId: string) => {
    if (!auth.currentUser || userProfile?.role !== 'organization') return;
    
    const orgProfile = userProfile as OrganizationProfile;
    const currentShortlist = orgProfile.shortlist || [];
    const isShortlisted = currentShortlist.includes(workerSetuId);
    
    const newShortlist = isShortlisted 
      ? currentShortlist.filter(id => id !== workerSetuId)
      : [...currentShortlist, workerSetuId];
      
    await updateProfile({ shortlist: newShortlist });
  };

  const sendHireRequest = async (workerId: string, workerName: string, jobTitle: string) => {
    if (!auth.currentUser || (userProfile?.role !== 'contractor' && userProfile?.role !== 'organization')) return;
    
    const profile = userProfile as any;
    const requestId = crypto.randomUUID();
    const hireRef = doc(db, 'hireRequests', requestId);
    
    try {
      await setDoc(hireRef, {
        id: requestId,
        contractorId: auth.currentUser.uid,
        workerId,
        workerName,
        contractorName: profile.companyName || profile.orgName || profile.name,
        contractorPhone: profile.phone || '',
        contractorLocation: profile.address || profile.location || profile.baseLocation || 'Remote/TBD',
        jobTitle,
        status: 'pending',
        createdAt: Date.now()
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `hireRequests/${requestId}`);
      return false;
    }
  };

  const respondToHireRequest = async (requestId: string, status: 'accepted' | 'declined') => {
    if (!auth.currentUser) return;
    const path = `hireRequests/${requestId}`;
    try {
      await updateDoc(doc(db, path), { status });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      return false;
    }
  };

  const postJobListing = async (job: Omit<JobListing, 'id' | 'contractorId' | 'contractorName' | 'contractorPhone' | 'contractorLocation' | 'createdAt' | 'status'>) => {
    if (!auth.currentUser || (userProfile?.role !== 'contractor' && userProfile?.role !== 'organization')) return;
    
    const profile = userProfile as any;
    const jobId = crypto.randomUUID();
    const jobRef = doc(db, 'jobListings', jobId);
    
    try {
      await setDoc(jobRef, {
        ...job,
        id: jobId,
        contractorId: auth.currentUser.uid,
        contractorName: profile.companyName || profile.orgName || profile.name,
        contractorPhone: profile.phone || '',
        contractorLocation: profile.address || profile.location || profile.baseLocation || 'Remote/TBD',
        status: 'active',
        createdAt: Date.now()
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `jobListings/${jobId}`);
      return false;
    }
  };

  const deleteJobListing = async (jobId: string) => {
    if (!auth.currentUser) return;
    const path = `jobListings/${jobId}`;
    try {
      await updateDoc(doc(db, path), { status: 'closed' });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      return false;
    }
  };

  const getUserProfile = async (uid: string) => {
    const path = `users/${uid}`;
    try {
      const docSnap = await getDoc(doc(db, path));
      return docSnap.exists() ? (docSnap.data() as UserProfile | OrganizationProfile | ContractorProfile) : null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  return {
    userProfile,
    workEntries,
    verificationRequests,
    hireRequests,
    jobListings,
    loading,
    stats,
    isActionLoading,
    generateSetuId,
    saveUserProfile,
    getUserProfile,
    addWorkEntry,
    respondToVerification,
    updateLanguage,
    updateProfile,
    toggleShortlist,
    sendHireRequest,
    respondToHireRequest,
    postJobListing,
    deleteJobListing
  };
}
