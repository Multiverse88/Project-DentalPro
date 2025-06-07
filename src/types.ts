
export enum ToothStatus {
  Healthy = 'Healthy',
  Decay = 'Decay',
  Filled = 'Filled',
  Extracted = 'Extracted',
  RootCanal = 'RootCanal',
  Crown = 'Crown',
  Missing = 'Missing', // Congenitally missing or prior to record
}

export interface Tooth {
  id: number; // Universal Numbering System (1-32)
  name: string; // e.g., "Upper Right Wisdom Tooth"
  status: ToothStatus;
   quadrant: 'UR' | 'UL' | 'LR' | 'LL'; // UpperRight, UpperLeft, LowerRight, LowerLeft
}

export interface Treatment {
  id: string;
  date: string; // ISO date string
  toothIds: number[];
  procedure: string;
  notes?: string;
  cost?: number;
}

export interface Patient {
  id: string;
  name: string;
  dob: string; // ISO date string, used in frontend
  date_of_birth?: string; // ISO date string, potentially used by API
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  address?: string;
  teeth: Tooth[];
  treatments: Treatment[];
  createdAt: string; // ISO date string
  // dentalRecords are NOT part of the patient object from /api/patients/:id
  // They are fetched separately via /api/patients/:patientId/dental
}

export interface OptionType {
  value: string;
  label: string;
}

// Authentication Types
export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Only used for mock registration/login, not stored in frontend state after login
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>; // Assuming API returns user details on login
}

// New Dental Record Type
export interface DentalRecord {
  id: string; // Assigned by the backend
  tooth_number: number;
  treatment_date: string; // ISO date string
  description: string;
  treatment_type: string;
}
