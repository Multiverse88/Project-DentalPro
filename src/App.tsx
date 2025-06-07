
import React, { useState, useCallback, useEffect } from 'react';
import { Patient, Tooth, Treatment, ToothStatus, User, DentalRecord } from './types';
// import { getDefaultTeeth } from './constants'; // getDefaultTeeth is now mainly for new patient UI state before API call
import { apiService } from './apiService'; 
import PatientListItem from './components/PatientListItem';
import PatientForm from './components/PatientForm';
import Modal from './components/Modal';
import TreatmentForm from './components/TreatmentForm';
import TreatmentHistory from './components/TreatmentHistory';
import ToothActionsPopover from './components/ToothActionsPopover';
import ToothComponent from './components/ToothComponent'; 
import AuthPage from './components/AuthPage';
import DentalRecordList from './components/DentalRecordList'; // New component
import DentalRecordForm from './components/DentalRecordForm'; // New component

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Omit<User, 'password'> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [defaultToothIdsForTreatment, setDefaultToothIdsForTreatment] = useState<number[]>([]);

  const [selectedToothIdsForChart, setSelectedToothIdsForChart] = useState<number[]>([]);
  const [popoverState, setPopoverState] = useState<{ tooth: Tooth | null; position: { top: number, left: number } | null }>({ tooth: null, position: null });
  
  const [searchTerm, setSearchTerm] = useState('');

  const [isLoading, setIsLoading] = useState(false); // For patient list/detail loading
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submissions

  // New state for Dental Records
  const [currentDentalRecords, setCurrentDentalRecords] = useState<DentalRecord[] | null>(null);
  const [isLoadingDentalRecords, setIsLoadingDentalRecords] = useState(false);
  const [dentalRecordsError, setDentalRecordsError] = useState<string | null>(null);
  const [isDentalRecordModalOpen, setIsDentalRecordModalOpen] = useState(false);


  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      setError(null);
      try {
        const user = await apiService.getAuthenticatedUser();
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setError(err instanceof Error ? err.message : 'Autentikasi gagal diperiksa.');
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Load patients if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const loadPatients = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedPatients = await apiService.fetchPatients();
          setPatients(fetchedPatients);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Gagal memuat data pasien.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      loadPatients();
    } else {
      setPatients([]);
      setSelectedPatientId(null);
    }
  }, [isAuthenticated]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  // Load dental records when a patient is selected
  useEffect(() => {
    if (selectedPatient && isAuthenticated) {
      const loadDentalRecords = async () => {
        setIsLoadingDentalRecords(true);
        setDentalRecordsError(null);
        try {
          const records = await apiService.fetchDentalRecords(selectedPatient.id);
          setCurrentDentalRecords(records);
        } catch (err) {
          setDentalRecordsError(err instanceof Error ? err.message : 'Gagal memuat catatan dental.');
          console.error(err);
          setCurrentDentalRecords([]); // Set to empty array on error to show "no records" state
        } finally {
          setIsLoadingDentalRecords(false);
        }
      };
      loadDentalRecords();
    } else {
      setCurrentDentalRecords(null); // Clear if no patient selected or not authenticated
    }
  }, [selectedPatient, isAuthenticated]);


  const handleLogin = (user: Omit<User, 'password'>) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setError(null); 
  };

  const handleLogout = async () => {
    setAuthLoading(true); 
    setError(null);
    try {
      await apiService.logoutUser();
    } catch (err) {
      console.error("Logout API call failed (if any):", err);
    } finally {
      setCurrentUser(null);
      setIsAuthenticated(false);
      setSelectedPatientId(null);
      setSearchTerm('');
      setIsPatientModalOpen(false);
      setIsTreatmentModalOpen(false);
      setIsDentalRecordModalOpen(false);
      setPatients([]); 
      setCurrentDentalRecords(null);
      setAuthLoading(false);
    }
  };

  const handlePatientSubmit = async (patientDataFromForm: Patient) => {
    if (!isAuthenticated) return;
    setIsSubmitting(true);
    setError(null);
    try {
      if (editingPatient) { 
        const updatedPatient = await apiService.updatePatient(editingPatient.id, patientDataFromForm);
        setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
        if (selectedPatientId === updatedPatient.id) {
            setSelectedPatientId(null); 
            setSelectedPatientId(updatedPatient.id);
        }
      } else { 
        const newPatientDataForApi = {
            name: patientDataFromForm.name,
            dob: patientDataFromForm.dob, 
            gender: patientDataFromForm.gender,
            contact: patientDataFromForm.contact, 
            address: patientDataFromForm.address,
        };
        const newPatient = await apiService.addPatient(newPatientDataForApi);
        setPatients(prev => [...prev, newPatient]);
      }
      setIsPatientModalOpen(false);
      setEditingPatient(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan data pasien.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPatientModal = (patient?: Patient) => {
    if (!isAuthenticated) return;
    setEditingPatient(patient || null);
    setIsPatientModalOpen(true);
    setError(null); 
  };

  const handleTreatmentSubmit = async (treatmentData: Treatment, updatedTeeth: Tooth[]) => {
     if (!selectedPatient || !isAuthenticated) return;
    setIsSubmitting(true);
    setError(null);
    try {
        let updatedPatientResult: Patient;
        if (editingTreatment) {
            updatedPatientResult = await apiService.updateTreatment(selectedPatient.id, treatmentData, updatedTeeth);
        } else {
            const treatmentDataForApi = { ...treatmentData };
            if (!treatmentDataForApi.id) { 
                 delete (treatmentDataForApi as any).id; 
            }
            updatedPatientResult = await apiService.addTreatment(selectedPatient.id, treatmentDataForApi, updatedTeeth);
        }
        setPatients(prev => prev.map(p => p.id === selectedPatient.id ? updatedPatientResult : p));
        if (selectedPatientId === updatedPatientResult.id) {
            setSelectedPatientId(null); 
            setSelectedPatientId(updatedPatientResult.id);
        }
        setIsTreatmentModalOpen(false);
        setEditingTreatment(null);
        setSelectedToothIdsForChart([]);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menyimpan data perawatan.');
        console.error(err);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleOpenTreatmentModal = (treatment?: Treatment, defaultToothIds: number[] = []) => {
    if (!isAuthenticated) return;
    setEditingTreatment(treatment || null);
    setDefaultToothIdsForTreatment(defaultToothIds);
    setIsTreatmentModalOpen(true);
    setPopoverState({ tooth: null, position: null }); 
    setError(null);
  };

  const handleDeleteTreatment = async (treatmentId: string) => {
    if (!selectedPatient || !isAuthenticated || !window.confirm('Apakah Anda yakin ingin menghapus riwayat perawatan ini? Tindakan ini tidak dapat diurungkan.')) return;
    setIsSubmitting(true);
    setError(null);
    try {
        const updatedPatientResult = await apiService.deleteTreatment(selectedPatient.id, treatmentId);
        setPatients(prev => prev.map(p => p.id === selectedPatient.id ? updatedPatientResult : p));
        if (selectedPatientId === updatedPatientResult.id) {
             setSelectedPatientId(null); 
             setSelectedPatientId(updatedPatientResult.id);
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menghapus data perawatan.');
        console.error(err);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleToothClickInChart = useCallback((toothId: number) => {
    setSelectedToothIdsForChart(prev => 
      prev.includes(toothId) ? prev.filter(id => id !== toothId) : [...prev, toothId]
    );
    setPopoverState({ tooth: null, position: null }); 
  }, []);

  const handleToothClickForPopover = (event: React.MouseEvent, tooth: Tooth) => {
    if (tooth.status === ToothStatus.Extracted || tooth.status === ToothStatus.Missing || !isAuthenticated) return;
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const popoverHeight = 280; 
    const popoverWidth = 240; 
    let top = rect.bottom + window.scrollY + 8;
    let left = rect.left + window.scrollX + (rect.width / 2) - (popoverWidth / 2);

    if (top + popoverHeight > window.innerHeight + window.scrollY) {
      top = rect.top + window.scrollY - popoverHeight - 8;
    }
    if (left + popoverWidth > window.innerWidth + window.scrollX - 10) {
      left = window.innerWidth + window.scrollX - popoverWidth - 10;
    }
     if (left < 10) {
      left = 10;
    }

    setPopoverState({
      tooth: tooth,
      position: { top, left }
    });
    setSelectedToothIdsForChart([tooth.id]); 
    setError(null);
  };

  const handleSetToothStatus = async (toothId: number, status: ToothStatus) => {
    if (!selectedPatient || !isAuthenticated) return;
    setIsSubmitting(true);
    setError(null);
    try {
        const updatedTeeth = selectedPatient.teeth.map(t => 
          t.id === toothId ? { ...t, status } : t
        );
        const updatedPatientResult = await apiService.updatePatientTeeth(selectedPatient.id, updatedTeeth);
        
        setPatients(prev => prev.map(p => p.id === selectedPatient.id ? updatedPatientResult : p));
        if (selectedPatientId === updatedPatientResult.id) {
            setSelectedPatientId(null); 
            setSelectedPatientId(updatedPatientResult.id);
        }
        setPopoverState({ tooth: null, position: null });
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal mengubah status gigi.');
        console.error(err);
    } finally {
        setIsSubmitting(false);
    }
  };

  // Dental Record handlers
  const handleOpenDentalRecordModal = () => {
    if (!isAuthenticated || !selectedPatient) return;
    setIsDentalRecordModalOpen(true);
    setDentalRecordsError(null); // Clear previous errors
  };

  const handleDentalRecordSubmit = async (recordData: Omit<DentalRecord, 'id'>) => {
    if (!selectedPatient || !isAuthenticated) return;
    setIsSubmitting(true);
    setDentalRecordsError(null);
    try {
      await apiService.addDentalRecord(selectedPatient.id, recordData);
      // Re-fetch dental records to update the list
      const records = await apiService.fetchDentalRecords(selectedPatient.id);
      setCurrentDentalRecords(records);
      setIsDentalRecordModalOpen(false);
    } catch (err) {
      setDentalRecordsError(err instanceof Error ? err.message : 'Gagal menyimpan catatan dental.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase()) 
  ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  const PatientDetailView: React.FC<{patient: Patient}> = ({ patient }) => {
    const upperRightTeeth = patient.teeth.filter(t => t.quadrant === 'UR').sort((a, b) => b.id - a.id);
    const upperLeftTeeth = patient.teeth.filter(t => t.quadrant === 'UL').sort((a, b) => a.id - b.id);
    const lowerRightTeeth = patient.teeth.filter(t => t.quadrant === 'LR').sort((a, b) => a.id - b.id); 
    const lowerLeftTeeth = patient.teeth.filter(t => t.quadrant === 'LL').sort((a, b) => b.id - a.id); 

    return (
        <div className="space-y-8">
            {error && <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-card">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-primary-dark">{patient.name}</h2>
                  <p className="text-gray-600 mt-1">ID Pasien: {patient.id.substring(0,8)}</p>
                  <div className="mt-3 space-y-1 text-gray-700">
                    <p>
                      Tanggal Lahir: {new Date(patient.dob).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p>Jenis Kelamin: {patient.gender}</p>
                    <p>Kontak: {patient.contact}</p>
                    {patient.address && <p>Alamat: {patient.address}</p>}
                  </div>
                </div>
                <button
                    onClick={() => handleOpenPatientModal(patient)}
                    disabled={isSubmitting}
                    className="mt-2 sm:mt-0 text-sm text-primary hover:text-primary-dark font-medium flex items-center py-2 px-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  Edit Info Pasien
                </button>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Peta Gigi Interaktif</h3>
              
              <div className="flex flex-col items-center space-y-1 select-none">
                <div className="text-center my-1"><h4 className="text-md font-semibold text-gray-700">Gigi Atas</h4></div>
                <div className="flex justify-center w-full"> 
                  <div className="flex"> 
                    {upperRightTeeth.map((tooth) => (
                      <div key={tooth.id} onClick={(e) => !isSubmitting && handleToothClickForPopover(e, tooth)} className={`inline-block ${isSubmitting ? 'cursor-not-allowed' : ''}`}>
                        <ToothComponent tooth={tooth} onClick={handleToothClickInChart} isSelected={selectedToothIdsForChart.includes(tooth.id)} />
                      </div>
                    ))}
                  </div>
                  <div className="border-l-2 border-slate-300 h-14 mx-1 sm:mx-1.5 self-center"></div>
                  <div className="flex"> 
                    {upperLeftTeeth.map((tooth) => (
                      <div key={tooth.id} onClick={(e) => !isSubmitting && handleToothClickForPopover(e, tooth)} className={`inline-block ${isSubmitting ? 'cursor-not-allowed' : ''}`}>
                        <ToothComponent tooth={tooth} onClick={handleToothClickInChart} isSelected={selectedToothIdsForChart.includes(tooth.id)} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t-2 border-slate-300 w-full max-w-xl my-2"></div>

                <div className="text-center my-1"><h4 className="text-md font-semibold text-gray-700">Gigi Bawah</h4></div>
                <div className="flex justify-center w-full">
                  <div className="flex">
                    {lowerRightTeeth.map((tooth) => (
                      <div key={tooth.id} onClick={(e) => !isSubmitting && handleToothClickForPopover(e, tooth)} className={`inline-block ${isSubmitting ? 'cursor-not-allowed' : ''}`}>
                        <ToothComponent tooth={tooth} onClick={handleToothClickInChart} isSelected={selectedToothIdsForChart.includes(tooth.id)} />
                      </div>
                    ))}
                  </div>
                  <div className="border-l-2 border-slate-300 h-14 mx-1 sm:mx-1.5 self-center"></div>
                  <div className="flex">
                    {lowerLeftTeeth.map((tooth) => (
                      <div key={tooth.id} onClick={(e) => !isSubmitting && handleToothClickForPopover(e, tooth)} className={`inline-block ${isSubmitting ? 'cursor-not-allowed' : ''}`}>
                        <ToothComponent tooth={tooth} onClick={handleToothClickInChart} isSelected={selectedToothIdsForChart.includes(tooth.id)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500 text-center">
                Klik gigi untuk opsi. Gigi terpilih untuk perawatan: {selectedToothIdsForChart.length > 0 ? selectedToothIdsForChart.sort((a,b)=>a-b).join(", ") : "Tidak ada"}
              </p>
               {isSubmitting && <p className="text-center text-sm text-primary mt-2">Memproses perubahan gigi...</p>}
            </div>
            
            {popoverState.tooth && popoverState.position && (
              <ToothActionsPopover
                tooth={popoverState.tooth}
                onSetStatus={handleSetToothStatus}
                onAddDetailedTreatment={(toothId) => handleOpenTreatmentModal(undefined, [toothId])}
                onClose={() => {
                    setPopoverState({ tooth: null, position: null });
                }}
                position={popoverState.position}
              />
            )}

            {/* Existing Treatment History Section */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-card">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
                <h3 className="text-xl font-semibold text-gray-800">Riwayat Perawatan Komprehensif</h3>
                <button
                  onClick={() => handleOpenTreatmentModal(undefined, selectedToothIdsForChart)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Tambah Perawatan Komprehensif
                </button>
              </div>
              <TreatmentHistory 
                treatments={patient.treatments} 
                teeth={patient.teeth}
                onEditTreatment={(treatment) => handleOpenTreatmentModal(treatment, treatment.toothIds)}
                onDeleteTreatment={handleDeleteTreatment}
                isSubmitting={isSubmitting}
              />
               {isSubmitting && patient.treatments.length > 0 && <p className="text-center text-sm text-primary mt-4">Memproses data perawatan...</p>}
            </div>

            {/* New Dental Records Section */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-card">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
                    <h3 className="text-xl font-semibold text-gray-800">Catatan Dental Tambahan</h3>
                    <button
                        onClick={handleOpenDentalRecordModal}
                        disabled={isSubmitting || isLoadingDentalRecords}
                        className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 disabled:opacity-50"
                        aria-label="Tambah Catatan Dental Baru"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H12m2.25 0h-.081c-.513 0-.992.074-1.442.213M10.5 16.5H12m2.25-1.5H12m-6-1.5V15a2.25 2.25 0 002.25 2.25h1.5M3.75 10.5a2.25 2.25 0 002.25 2.25h9.75V15m0 0a2.25 2.25 0 01-2.25 2.25H5.25m10.5-11.25h.008v.008h-.008V4.5z" />
                        </svg>
                        Tambah Catatan Dental
                    </button>
                </div>
                {isLoadingDentalRecords ? (
                    <p className="text-center text-gray-500 py-4">Memuat catatan dental...</p>
                ) : dentalRecordsError ? (
                    <p className="text-center text-red-500 py-4">Error: {dentalRecordsError}</p>
                ) : (
                    <DentalRecordList dentalRecords={currentDentalRecords || []} />
                )}
                {isSubmitting && isDentalRecordModalOpen && <p className="text-center text-sm text-primary mt-4">Menyimpan catatan dental...</p>}
            </div>
        </div>
    );
  }

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50">
        <div role="status" className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" aria-label="Loading authentication...">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Memeriksa autentikasi...</span>
        </div>
        <p className="mt-4 text-lg text-gray-600">Memeriksa autentikasi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">
      <nav className="bg-white text-gray-700 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <h1 className="text-2xl font-bold text-primary">DentalRecord Pro</h1>
                <div className="flex items-center space-x-4">
                    {isAuthenticated && selectedPatientId && (
                        <button 
                        onClick={() => {setSelectedPatientId(null); setSelectedToothIdsForChart([]); setPopoverState({ tooth: null, position: null }); setError(null); setCurrentDentalRecords(null); setDentalRecordsError(null);}}
                        className="px-4 py-2 text-sm font-medium bg-primary-light hover:bg-primary text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                        >
                        &larr; Daftar Pasien
                        </button>
                    )}
                    {isAuthenticated && currentUser && (
                    <>
                        <span className="text-sm text-gray-600 hidden sm:block">Login sebagai: <span className="font-semibold">{currentUser.email}</span></span>
                        <button 
                        onClick={handleLogout}
                        disabled={authLoading} 
                        className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50  disabled:opacity-50"
                        >
                        Logout
                        </button>
                    </>
                    )}
                </div>
            </div>
        </div>
      </nav>

      {!isAuthenticated ? (
          <AuthPage onLoginSuccess={handleLogin} />
      ) : (
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          {isLoading && !selectedPatientId ? ( // Main patient list loading
              <div className="text-center py-20">
                  <div role="status" className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" aria-label="Loading...">
                      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                  </div>
                  <p className="mt-4 text-lg text-gray-600">Memuat data pasien...</p>
              </div>
          ) : error && !selectedPatientId ? ( // Global error on patient list view
              <div className="text-center py-10">
                  <p className="text-red-600 font-semibold text-xl">Error: {error}</p>
                  <button onClick={() => { setError(null); if (isAuthenticated) { const loadPatients = async () => { setIsLoading(true); setError(null); try { const fetchedPatients = await apiService.fetchPatients(); setPatients(fetchedPatients); } catch (err) { setError(err instanceof Error ? err.message : 'Gagal memuat data pasien.'); console.error(err); } finally { setIsLoading(false); } }; loadPatients(); } else { window.location.reload(); } }} className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">Coba Lagi</button>
              </div>
          ) : !selectedPatientId ? ( // Patient List View
            <div className="max-w-4xl mx-auto">
              {error && <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div> }
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Daftar Pasien</h2>
                <button
                  onClick={() => handleOpenPatientModal()}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 text-base font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Tambah Pasien Baru
                </button>
              </div>
              <div className="mb-6">
                <input 
                  type="text"
                  placeholder="Cari pasien berdasarkan nama atau ID..."
                  className="w-full p-3.5 text-base border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {isSubmitting && <p className="text-center text-sm text-primary mb-4">Memproses...</p>}
              {filteredPatients.length > 0 ? (
                <ul className="space-y-5">
                  {filteredPatients.map(patient => (
                    <PatientListItem 
                      key={patient.id} 
                      patient={patient} 
                      onSelectPatient={(id) => { setSelectedPatientId(id); setError(null); setDentalRecordsError(null);}}
                      onEditPatient={handleOpenPatientModal}
                    />
                  ))}
                </ul>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.79-.44 1.06l-.44.439-.44-.44a1.5 1.5 0 010-2.12l.44-.44.44.44A1.5 1.5 0 019.75 9.75zm4.5 0c0 .414-.168.79-.44 1.06l-.44.439-.44-.44a1.5 1.5 0 010-2.12l.44-.44.44.44A1.5 1.5 0 0114.25 9.75z" />
                  </svg>
                  <p className="text-xl">
                  {patients.length === 0 && !searchTerm ? "Belum ada data pasien." : "Pasien tidak ditemukan."}
                  </p>
                  <p className="mt-2 text-sm">
                  {patients.length === 0 && !searchTerm ? "Klik 'Tambah Pasien Baru' untuk memulai." : "Coba kata kunci lain atau periksa ejaan."}
                  </p>
                </div>
              )}
            </div>
          ) : selectedPatient && (isLoading && selectedPatientId) ? ( // Patient detail specific loading (e.g. if we refetch patient for detail)
            <div className="text-center py-20">
                <div role="status" className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" aria-label="Loading patient details..."></div>
                <p className="mt-4 text-lg text-gray-600">Memuat detail pasien...</p>
            </div>
           ) : selectedPatient ? ( // Patient Detail View
            <PatientDetailView patient={selectedPatient} />
          ) : ( 
            <p className="text-center text-red-600 font-semibold text-xl py-10">Pasien tidak ditemukan atau gagal dimuat. Silakan kembali ke daftar pasien.</p>
          )}
        </main>
      )}

      {/* Modals are only rendered if authenticated */}
      {isAuthenticated && (
        <>
          <Modal
            isOpen={isPatientModalOpen}
            onClose={() => {setIsPatientModalOpen(false); setEditingPatient(null); setError(null);}}
            title={editingPatient ? 'Edit Informasi Pasien' : 'Tambah Pasien Baru'}
            size="lg"
          >
            <PatientForm
              onSubmit={handlePatientSubmit}
              onClose={() => {setIsPatientModalOpen(false); setEditingPatient(null); setError(null);}}
              initialData={editingPatient}
              isSubmitting={isSubmitting}
            />
            {isSubmitting && <p className="text-center text-sm text-primary mt-2">Menyimpan data pasien...</p>}
            {error && isPatientModalOpen && <p className="text-center text-sm text-red-500 mt-2">{error}</p>}
          </Modal>

          {selectedPatient && ( 
            <>
              <Modal
                isOpen={isTreatmentModalOpen}
                onClose={() => {setIsTreatmentModalOpen(false); setEditingTreatment(null); setSelectedToothIdsForChart([]); setError(null);}}
                title={editingTreatment ? 'Edit Riwayat Perawatan' : 'Tambah Riwayat Perawatan'}
                size="xl"
              >
                <TreatmentForm
                  patient={selectedPatient}
                  onSubmit={handleTreatmentSubmit}
                  onClose={() => {setIsTreatmentModalOpen(false); setEditingTreatment(null); setSelectedToothIdsForChart([]); setError(null);}}
                  initialTreatment={editingTreatment}
                  defaultSelectedToothIds={editingTreatment ? editingTreatment.toothIds : defaultToothIdsForTreatment}
                  isSubmitting={isSubmitting}
                />
                {isSubmitting && <p className="text-center text-sm text-primary mt-2">Menyimpan data perawatan...</p>}
                {error && isTreatmentModalOpen && <p className="text-center text-sm text-red-500 mt-2">{error}</p>}
              </Modal>

              <Modal
                isOpen={isDentalRecordModalOpen}
                onClose={() => { setIsDentalRecordModalOpen(false); setDentalRecordsError(null); }}
                title="Tambah Catatan Dental Baru"
                size="lg"
              >
                <DentalRecordForm
                  patient={selectedPatient}
                  onSubmit={handleDentalRecordSubmit}
                  onClose={() => { setIsDentalRecordModalOpen(false); setDentalRecordsError(null); }}
                  isSubmitting={isSubmitting}
                />
                {isSubmitting && <p className="text-center text-sm text-primary mt-2">Menyimpan catatan dental...</p>}
                {dentalRecordsError && isDentalRecordModalOpen && <p className="text-center text-sm text-red-500 mt-2">{dentalRecordsError}</p>}
              </Modal>
            </>
          )}
        </>
      )}
      <footer className="text-center py-10 text-sm text-gray-500 border-t border-gray-200 mt-16">
        DentalRecord Pro &copy; {new Date().getFullYear()}. Aplikasi Rekam Medis Gigi.
      </footer>
    </div>
  );
};

export default App;
