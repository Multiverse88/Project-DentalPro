
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
  dob: string; // ISO date string
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  address?: string;
  teeth: Tooth[];
  treatments: Treatment[];
  createdAt: string; // ISO date string
}

export interface OptionType {
  value: string;
  label: string;
}
    