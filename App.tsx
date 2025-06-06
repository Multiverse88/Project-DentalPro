
import React, { useState, useCallback, useEffect } from 'react';
import { Patient, Tooth, Treatment, ToothStatus } from './types';
import { getDefaultTeeth } from './constants'; // ANATOMICAL_LABELS are no longer used here directly
import useLocalStorage from './hooks/useLocalStorage';
import PatientListItem from './components/PatientListItem';
import PatientForm from './components/PatientForm';
import Modal from './components/Modal';
// import DentalChart from './components/DentalChart'; // Not directly used in PatientDetailView as it has custom layout
import TreatmentForm from './components/TreatmentForm';
import TreatmentHistory from './components/TreatmentHistory';
import ToothActionsPopover from './components/ToothActionsPopover';
import ToothComponent from './components/ToothComponent'; 

// Sample data for initial load if localStorage is empty
const getInitialPatients = (): Patient[] => {
    const p1Id = crypto.randomUUID();
    const p2Id = crypto.randomUUID();
    return [
        {
            id: p1Id,
            name: 'Budi Santoso',
            dob: '1985-07-15T00:00:00.000Z',
            gender: 'Male',
            contact: '081234567890',
            address: 'Jl. Merdeka No. 10, Jakarta',
            teeth: getDefaultTeeth().map(t => {
                if (t.id === 3) return {...t, status: ToothStatus.Filled};
                if (t.id === 14) return {...t, status: ToothStatus.Crown};
                if (t.id === 18) return {...t, status: ToothStatus.Extracted};
                return t;
            }),
            treatments: [
                { id: crypto.randomUUID(), date: '2023-05-10T00:00:00.000Z', toothIds: [3], procedure: 'Penambalan Komposit', notes: 'Gigi seri atas, tambalan lama diganti.', cost: 500000 },
                { id: crypto.randomUUID(), date: '2023-08-20T00:00:00.000Z', toothIds: [14], procedure: 'Pemasangan Crown PFM', cost: 1500000 },
                 { id: crypto.randomUUID(), date: '2022-01-15T00:00:00.000Z', toothIds: [18], procedure: 'Ekstraksi gigi molar', notes: 'Impaksi, bedah minor.', cost: 800000 },
            ],
            createdAt: new Date().toISOString(),
        },
        {
            id: p2Id,
            name: 'Citra Lestari',
            dob: '1992-03-22T00:00:00.000Z',
            gender: 'Female',
            contact: 'citra.lestari@email.com',
            address: 'Jl. Mawar No. 5, Bandung',
            teeth: getDefaultTeeth().map(t => {
                if (t.id === 30) return {...t, status: ToothStatus.RootCanal};
                return t;
            }),
            treatments: [
                 { id: crypto.randomUUID(), date: '2024-01-10T00:00:00.000Z', toothIds: [30], procedure: 'Perawatan Saluran Akar', notes: 'Single visit.', cost: 1200000 }
            ],
            createdAt: new Date().toISOString(),
        }
    ];
};


const App: React.FC = () => {
  const [patients, setPatients] = useLocalStorage<Patient[]>('dentalPatients', getInitialPatients());
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [defaultToothIdsForTreatment, setDefaultToothIdsForTreatment] = useState<number[]>([]);

  const [selectedToothIdsForChart, setSelectedToothIdsForChart] = useState<number[]>([]);
  const [popoverState, setPopoverState] = useState<{ tooth: Tooth | null; position: { top: number, left: number } | null }>({ tooth: null, position: null });
  
  const [searchTerm, setSearchTerm] = useState('');

  const handlePatientSubmit = (patientData: Patient) => {
    if (editingPatient) {
      setPatients(prev => prev.map(p => p.id === patientData.id ? patientData : p));
    } else {
      setPatients(prev => [...prev, patientData]);
    }
    setIsPatientModalOpen(false);
    setEditingPatient(null);
  };

  const handleOpenPatientModal = (patient?: Patient) => {
    setEditingPatient(patient || null);
    setIsPatientModalOpen(true);
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const handleTreatmentSubmit = (treatmentData: Treatment, updatedTeeth: Tooth[]) => {
     if (!selectedPatient) return;
    
    const updatedTreatments = editingTreatment 
        ? selectedPatient.treatments.map(t => t.id === treatmentData.id ? treatmentData : t)
        : [...selectedPatient.treatments, treatmentData];
    
    const updatedPatient: Patient = {
        ...selectedPatient,
        teeth: updatedTeeth,
        treatments: updatedTreatments,
    };
    
    setPatients(prev => prev.map(p => p.id === selectedPatient.id ? updatedPatient : p));
    setIsTreatmentModalOpen(false);
    setEditingTreatment(null);
    setSelectedToothIdsForChart([]); // Clear chart selection after treatment
  };

  const handleOpenTreatmentModal = (treatment?: Treatment, defaultToothIds: number[] = []) => {
    setEditingTreatment(treatment || null);
    setDefaultToothIdsForTreatment(defaultToothIds);
    setIsTreatmentModalOpen(true);
    setPopoverState({ tooth: null, position: null }); // Close popover if open
  };

  const handleDeleteTreatment = (treatmentId: string) => {
    if (!selectedPatient) return;
    const updatedTreatments = selectedPatient.treatments.filter(t => t.id !== treatmentId);
    const updatedPatient = { ...selectedPatient, treatments: updatedTreatments };
    setPatients(prev => prev.map(p => p.id === selectedPatient.id ? updatedPatient : p));
  };
  
  const handleToothClickInChart = useCallback((toothId: number) => {
    setSelectedToothIdsForChart(prev => 
      prev.includes(toothId) ? prev.filter(id => id !== toothId) : [...prev, toothId]
    );
    setPopoverState({ tooth: null, position: null }); 
  }, []);

  const handleToothClickForPopover = (event: React.MouseEvent, tooth: Tooth) => {
    if (tooth.status === ToothStatus.Extracted || tooth.status === ToothStatus.Missing) return;
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const popoverHeight = 280; 
    const popoverWidth = 240; 
    let top = rect.bottom + window.scrollY + 8;
    let left = rect.left + window.scrollX + (rect.width / 2) - (popoverWidth / 2); // Center popover

    if (top + popoverHeight > window.innerHeight + window.scrollY) {
      top = rect.top + window.scrollY - popoverHeight - 8;
    }
    if (left + popoverWidth > window.innerWidth + window.scrollX - 10) { // 10 for padding from edge
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
  };

  const handleSetToothStatus = (toothId: number, status: ToothStatus) => {
    if (!selectedPatient) return;
    const updatedTeeth = selectedPatient.teeth.map(t => 
      t.id === toothId ? { ...t, status } : t
    );
    const updatedPatient = { ...selectedPatient, teeth: updatedTeeth };
    setPatients(prev => prev.map(p => p.id === selectedPatient.id ? updatedPatient : p));
    setPopoverState({ tooth: null, position: null });
  };
  
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  const PatientDetailView: React.FC<{patient: Patient}> = ({ patient }) => {
    // Sort teeth for anatomical arch display
    const upperRightTeeth = patient.teeth.filter(t => t.quadrant === 'UR').sort((a, b) => b.id - a.id); // 8, 7, ..., 1
    const upperLeftTeeth = patient.teeth.filter(t => t.quadrant === 'UL').sort((a, b) => a.id - b.id);   // 9, 10, ..., 16
    const lowerRightTeeth = patient.teeth.filter(t => t.quadrant === 'LR').sort((a, b) => a.id - b.id);   // 25, 26, ..., 32
    const lowerLeftTeeth = patient.teeth.filter(t => t.quadrant === 'LL').sort((a, b) => b.id - a.id);    // 24, 23, ..., 17

    return (
        <div className="space-y-8">
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
                    className="mt-2 sm:mt-0 text-sm text-primary hover:text-primary-dark font-medium flex items-center py-2 px-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
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
                {/* Upper Jaw */}
                <div className="text-center my-1"><h4 className="text-md font-semibold text-gray-700">Gigi Atas</h4></div>
                <div className="flex justify-center w-full"> 
                  <div className="flex"> 
                    {upperRightTeeth.map((tooth) => (
                      <div key={tooth.id} onClick={(e) => handleToothClickForPopover(e, tooth)} className="inline-block">
                        <ToothComponent tooth={tooth} onClick={handleToothClickInChart} isSelected={selectedToothIdsForChart.includes(tooth.id)} />
                      </div>
                    ))}
                  </div>
                  <div className="border-l-2 border-slate-300 h-14 mx-1 sm:mx-1.5 self-center"></div> {/* Midline */}
                  <div className="flex"> 
                    {upperLeftTeeth.map((tooth) => (
                      <div key={tooth.id} onClick={(e) => handleToothClickForPopover(e, tooth)} className="inline-block">
                        <ToothComponent tooth={tooth} onClick={handleToothClickInChart} isSelected={selectedToothIdsForChart.includes(tooth.id)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Horizontal separator between jaws */}
                <div className="border-t-2 border-slate-300 w-full max-w-xl my-2"></div>

                {/* Lower Jaw */}
                <div className="text-center my-1"><h4 className="text-md font-semibold text-gray-700">Gigi Bawah</h4></div>
                <div className="flex justify-center w-full">
                  <div className="flex">
                    {lowerRightTeeth.map((tooth) => (
                      <div key={tooth.id} onClick={(e) => handleToothClickForPopover(e, tooth)} className="inline-block">
                        <ToothComponent tooth={tooth} onClick={handleToothClickInChart} isSelected={selectedToothIdsForChart.includes(tooth.id)} />
                      </div>
                    ))}
                  </div>
                  <div className="border-l-2 border-slate-300 h-14 mx-1 sm:mx-1.5 self-center"></div> {/* Midline */}
                  <div className="flex">
                    {lowerLeftTeeth.map((tooth) => (
                      <div key={tooth.id} onClick={(e) => handleToothClickForPopover(e, tooth)} className="inline-block">
                        <ToothComponent tooth={tooth} onClick={handleToothClickInChart} isSelected={selectedToothIdsForChart.includes(tooth.id)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500 text-center">
                Klik gigi untuk opsi. Gigi terpilih untuk perawatan: {selectedToothIdsForChart.length > 0 ? selectedToothIdsForChart.sort((a,b)=>a-b).join(", ") : "Tidak ada"}
              </p>
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

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-card">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
                <h3 className="text-xl font-semibold text-gray-800">Riwayat Perawatan</h3>
                <button
                  onClick={() => handleOpenTreatmentModal(undefined, selectedToothIdsForChart)}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Tambah Perawatan
                </button>
              </div>
              <TreatmentHistory 
                treatments={patient.treatments} 
                teeth={patient.teeth}
                onEditTreatment={(treatment) => handleOpenTreatmentModal(treatment, treatment.toothIds)}
                onDeleteTreatment={handleDeleteTreatment}
              />
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">
      <nav className="bg-white text-gray-700 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <h1 className="text-2xl font-bold text-primary">DentalRecord Pro</h1>
                {selectedPatientId && (
                    <button 
                    onClick={() => {setSelectedPatientId(null); setSelectedToothIdsForChart([]); setPopoverState({ tooth: null, position: null });}}
                    className="px-4 py-2 text-sm font-medium bg-primary-light hover:bg-primary text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                    >
                    &larr; Daftar Pasien
                    </button>
                )}
            </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {!selectedPatientId ? (
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <h2 className="text-3xl font-bold text-gray-800">Daftar Pasien</h2>
              <button
                onClick={() => handleOpenPatientModal()}
                className="w-full sm:w-auto px-5 py-2.5 text-base font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v1.5m0 0v1.5m0-1.5h1.5m-1.5 0h-1.5m-6 4.5V7.5m0 0v1.5m0-1.5h1.5m-1.5 0h-1.5m7.5 4.5v1.5m0 0v1.5m0-1.5h1.5M12 18.75h-1.5m1.5 0h1.5M4.5 7.5v1.5m0 0v1.5m0-1.5H6m-1.5 0H3m1.5 7.5v1.5m0 0v1.5m0-1.5H6m-1.5 0H3m7.5 4.5v1.5m0 0v1.5m0-1.5h1.5m-1.5 0h-1.5M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.91-.11-1.35M12 3c.95.001 1.88.146 2.77.412M12 3v2.25m0 0V9.75M12 5.25v2.25m0 0V9.75m0 0H9.75M12 9.75H14.25M12 9.75V12m0 0V14.25m0 0H9.75M12 14.25H14.25" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9zm4.33 4.5H12v4.5m4.33-4.5L12 13.5m4.33-4.5L12 4.5M7.67 4.5H12m0 0v4.5m-4.33 0L12 4.5m-4.33 0L12 13.5"/> {/* User Plus icon */}
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
            {filteredPatients.length > 0 ? (
              <ul className="space-y-5">
                {filteredPatients.map(patient => (
                  <PatientListItem 
                    key={patient.id} 
                    patient={patient} 
                    onSelectPatient={setSelectedPatientId}
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
                 {patients.length === 0 ? "Belum ada data pasien." : "Pasien tidak ditemukan."}
                </p>
                <p className="mt-2 text-sm">
                 {patients.length === 0 ? "Klik 'Tambah Pasien Baru' untuk memulai." : "Coba kata kunci lain atau periksa ejaan."}
                </p>
              </div>
            )}
          </div>
        ) : selectedPatient ? (
          <PatientDetailView patient={selectedPatient} />
        ) : (
           <p className="text-center text-red-600 font-semibold text-xl py-10">Pasien tidak ditemukan atau gagal dimuat.</p>
        )}
      </main>

      <Modal
        isOpen={isPatientModalOpen}
        onClose={() => {setIsPatientModalOpen(false); setEditingPatient(null);}}
        title={editingPatient ? 'Edit Informasi Pasien' : 'Tambah Pasien Baru'}
        size="lg"
      >
        <PatientForm
          onSubmit={handlePatientSubmit}
          onClose={() => {setIsPatientModalOpen(false); setEditingPatient(null);}}
          initialData={editingPatient}
        />
      </Modal>

      {selectedPatient && (
        <Modal
          isOpen={isTreatmentModalOpen}
          onClose={() => {setIsTreatmentModalOpen(false); setEditingTreatment(null); setSelectedToothIdsForChart([]);}}
          title={editingTreatment ? 'Edit Riwayat Perawatan' : 'Tambah Riwayat Perawatan'}
          size="xl"
        >
          <TreatmentForm
            patient={selectedPatient}
            onSubmit={handleTreatmentSubmit}
            onClose={() => {setIsTreatmentModalOpen(false); setEditingTreatment(null); setSelectedToothIdsForChart([]);}}
            initialTreatment={editingTreatment}
            defaultSelectedToothIds={editingTreatment ? editingTreatment.toothIds : defaultToothIdsForTreatment}
          />
        </Modal>
      )}
      <footer className="text-center py-10 text-sm text-gray-500 border-t border-gray-200 mt-16">
        DentalRecord Pro &copy; {new Date().getFullYear()}. Aplikasi Rekam Medis Gigi.
      </footer>
    </div>
  );
};

export default App;
