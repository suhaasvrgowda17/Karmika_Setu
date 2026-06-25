/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum WorkCategory {
  CONSTRUCTION = 'Construction',
  AGRICULTURE = 'Agriculture',
  DOMESTIC = 'Domestic Help',
  LOGISTICS = 'Logistics/Delivery',
  MANUFACTURING = 'Manufacturing',
  OTHER = 'Other'
}

export interface WorkEntry {
  id: string;
  userId: string;
  date: string;
  category: WorkCategory;
  workType: string;
  location: string;
  contractorName?: string;
  hoursWorked: number;
  paymentReceived: number;
  paymentStatus: 'Pending' | 'Paid';
  voiceNoteUrl?: string;
  createdAt: number;
  isVerified?: boolean;
  status?: 'pending' | 'verified' | 'rejected';
  geoTag?: { lat: number; lng: number };
  contractorId?: string; // Linking to a specific contractor
}

export type UserRole = 'worker' | 'contractor' | 'organization';

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  aadhaarMasked?: string;
  aadhaarFull?: string; // Full Aadhaar for organization verification
  pan?: string; // PAN card for organization verification
  totalDaysWorked: number;
  totalEarnings: number;
  notificationsEnabled?: boolean;
  preferredLanguage: 'en' | 'hi' | 'kn' | 'ta' | 'te' | 'ml' | 'mr' | 'bn';
  role: 'worker';
  setuId: string; // Unique ID like SS-XXXX
  photoUrl?: string;
  isVerified?: boolean;
  status?: WorkerPresenceStatus;
}

export interface JobListing {
  id: string;
  contractorId: string;
  contractorName: string;
  contractorPhone: string;
  contractorLocation: string;
  title: string;
  location: string;
  dailyWage: number;
  description: string;
  category: WorkCategory;
  status: 'active' | 'closed';
  createdAt: number;
}

export interface ContractorProfile {
  uid: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  aadhaarMasked?: string;
  aadhaarFull?: string;
  pan?: string;
  address: string;
  notificationsEnabled?: boolean;
  role: 'contractor';
  pradhanId: string; // SS-PR-XXXX
  jobListings?: JobListing[];
}

export interface OrganizationProfile {
  uid: string;
  orgName: string;
  contactPerson: string;
  email: string;
  orgType: string; 
  address: string;
  notificationsEnabled?: boolean;
  role: 'organization';
  setuId: string; // e.g. SS-ORG-XXXX
  shortlist?: string[];
  jobListings?: JobListing[];
}

export interface VerificationRequest {
  id: string;
  workerId: string;
  workerName: string;
  entryId: string;
  date: string;
  workType: string;
  hours: number;
  contractorId: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: number;
}

export interface HireRequest {
  id: string;
  contractorId: string;
  workerId: string;
  workerName: string;
  contractorName: string;
  contractorPhone: string;
  contractorLocation: string;
  jobTitle: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
}

export type WorkerPresenceStatus = 'working' | 'available' | 'offline';

export interface WorkerStatusUpdate {
  uid: string;
  name: string;
  skill: string;
  location: string;
  status: WorkerPresenceStatus;
  lastActive: number;
}

export type Section = 'profile' | 'analysis' | 'add-work' | 'history' | 'report' | 'settings' | 'org-dashboard' | 'contractor-dashboard' | 'worker-search' | 'help' | 'shortlist' | 'impact' | 'community' | 'org-analysis' | 'financial' | 'support' | 'hire-workers' | 'live-workforce' | 'job-board' | 'labour-card';
