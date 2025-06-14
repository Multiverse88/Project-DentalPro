
import { Patient, Treatment, Tooth, User, AuthResponse, DentalRecord } from './types';
import { getDefaultTeeth } from './constants';

const API_BASE_URL = process.env.API_BASE_URL || '/api'; // Use environment variable or default
const AUTH_TOKEN_KEY = 'dentalAppAuthToken';
const AUTH_USER_KEY = 'dentalAppAuthUser';

const API_DELAY_SIMULATION = 0; // Set to 0 for real API, or > 0 to simulate delay

// Helper to simulate API delay if needed
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get stored auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

// Helper to handle API responses
const handleApiResponse = async (response: Response) => {
  if (API_DELAY_SIMULATION > 0) await delay(API_DELAY_SIMULATION);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  if (response.status === 204) { // No Content
    return null;
  }
  return response.json();
};

// Map patient data for sending to API (dob to date_of_birth)
const mapPatientToApi = (patientData: Partial<Patient>): any => {
  const apiPatient: any = { ...patientData };
  if (apiPatient.dob) {
    apiPatient.date_of_birth = apiPatient.dob;
    delete apiPatient.dob;
  }
  // Remove fields not typically sent or generated by frontend for create/update
  delete apiPatient.id;
  delete apiPatient.createdAt;
  return apiPatient;
};

// Map patient data received from API (date_of_birth to dob)
const mapPatientFromApi = (apiPatient: any): Patient => {
  const patient: any = { ...apiPatient };
  if (apiPatient.date_of_birth) {
    patient.dob = apiPatient.date_of_birth;
    // delete patient.date_of_birth; // Keep if needed, or remove
  }
  return patient as Patient;
};


export const apiService = {
  // --- Auth API ---
  registerUser: async (userData: Pick<User, 'username' | 'email' | 'password'>): Promise<Omit<User, 'password'>> => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleApiResponse(response);
  },

  loginUser: async (credentials: Pick<User, 'email' | 'password'>): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const authResponse: AuthResponse = await handleApiResponse(response);
    if (authResponse.token && authResponse.user) {
      localStorage.setItem(AUTH_TOKEN_KEY, authResponse.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authResponse.user));
    }
    return authResponse;
  },

  logoutUser: async (): Promise<void> => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    if (API_DELAY_SIMULATION > 0) await delay(API_DELAY_SIMULATION / 2);
    return Promise.resolve();
  },

  getAuthenticatedUser: async (): Promise<Omit<User, 'password'> | null> => {
    const token = getAuthToken();
    const userJson = localStorage.getItem(AUTH_USER_KEY);
    if (API_DELAY_SIMULATION > 0) await delay(API_DELAY_SIMULATION / 3);
    if (token && userJson) {
      try {
        return JSON.parse(userJson) as Omit<User, 'password'>;
      } catch (e) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        return null;
      }
    }
    return null;
  },

  // --- Patient API ---
  fetchPatients: async (): Promise<Patient[]> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/patients`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const patientsFromApi = await handleApiResponse(response);
    return patientsFromApi.map(mapPatientFromApi);
  },

  fetchPatientById: async (patientId: string): Promise<Patient> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const patientFromApi = await handleApiResponse(response);
    return mapPatientFromApi(patientFromApi);
  },

  addPatient: async (
    patientData: Pick<Patient, 'name' | 'dob' | 'gender'> & Partial<Pick<Patient, 'contact' | 'address'>>
  ): Promise<Patient> => {
    const token = getAuthToken();
    const bodyToSend = {
      name: patientData.name,
      date_of_birth: patientData.dob, 
      gender: patientData.gender,
      ...(patientData.contact && { contact: patientData.contact }),
      ...(patientData.address && { address: patientData.address }),
    };
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyToSend),
    });
    const newPatientFromApi = await handleApiResponse(response);
    return mapPatientFromApi(newPatientFromApi);
  },

  updatePatient: async (patientId: string, patientData: Patient): Promise<Patient> => {
    const token = getAuthToken();
    const patientCopy = JSON.parse(JSON.stringify(patientData));
    const apiPayload = mapPatientToApi(patientCopy);
    delete apiPayload.id; 
    delete apiPayload.createdAt;

    const fullApiPayload = {
        name: apiPayload.name,
        date_of_birth: apiPayload.date_of_birth,
        gender: apiPayload.gender,
        contact: apiPayload.contact,
        address: apiPayload.address,
        teeth: patientData.teeth, 
        treatments: patientData.treatments, 
    };

    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(fullApiPayload),
    });
    const updatedPatientFromApi = await handleApiResponse(response);
    return mapPatientFromApi(updatedPatientFromApi);
  },

  deletePatient: async (patientId: string): Promise<void> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await handleApiResponse(response); 
  },

  // --- Treatment and Teeth operations using the above Patient API structure ---
  addTreatment: async (patientId: string, treatmentData: Omit<Treatment, 'id'>, updatedTeeth: Tooth[]): Promise<Patient> => {
    const patient = await apiService.fetchPatientById(patientId);
    const newTreatment: Treatment = {
      ...treatmentData,
      id: crypto.randomUUID(), 
    };
    patient.treatments.push(newTreatment);
    patient.teeth = updatedTeeth;
    return apiService.updatePatient(patientId, patient);
  },

  updateTreatment: async (patientId: string, updatedTreatmentData: Treatment, updatedTeeth: Tooth[]): Promise<Patient> => {
    const patient = await apiService.fetchPatientById(patientId);
    const treatmentIndex = patient.treatments.findIndex(t => t.id === updatedTreatmentData.id);
    if (treatmentIndex === -1) throw new Error(`Treatment with ID ${updatedTreatmentData.id} not found`);
    
    patient.treatments[treatmentIndex] = updatedTreatmentData;
    patient.teeth = updatedTeeth;
    return apiService.updatePatient(patientId, patient);
  },

  deleteTreatment: async (patientId: string, treatmentId: string): Promise<Patient> => {
    const patient = await apiService.fetchPatientById(patientId);
    patient.treatments = patient.treatments.filter(t => t.id !== treatmentId);
    return apiService.updatePatient(patientId, patient);
  },
  
  updatePatientTeeth: async (patientId: string, teeth: Tooth[]): Promise<Patient> => {
    const patient = await apiService.fetchPatientById(patientId);
    patient.teeth = teeth;
    return apiService.updatePatient(patientId, patient);
  },

  // --- Dental Records API ---
  fetchDentalRecords: async (patientId: string): Promise<DentalRecord[]> => {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication token not found.");
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/dental`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Assuming API returns an array of dental records, with fields matching DentalRecord interface
    // (e.g., id, tooth_number, treatment_date, description, treatment_type)
    return handleApiResponse(response); 
  },

  addDentalRecord: async (patientId: string, recordData: Omit<DentalRecord, 'id'>): Promise<DentalRecord> => {
    const token = getAuthToken();
    if (!token) throw new Error("Authentication token not found.");
    
    // API expects: { tooth_number, treatment_date, description, treatment_type }
    const bodyToSend = {
      tooth_number: recordData.tooth_number,
      treatment_date: recordData.treatment_date, // Ensure this is ISO string
      description: recordData.description,
      treatment_type: recordData.treatment_type,
    };

    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/dental`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyToSend),
    });
    // Assuming API returns the newly created dental record, including its server-assigned 'id'
    return handleApiResponse(response);
  },
};
