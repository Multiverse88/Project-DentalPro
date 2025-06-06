
import React, { useState, useEffect } from 'react';
import { Treatment, Tooth, Patient, ToothStatus, OptionType } from '../types';
import { TOOTH_STATUS_OPTIONS } from '../constants';

interface TreatmentFormProps {
  patient: Patient;
  onSubmit: (treatment: Treatment, updatedTeeth: Tooth[]) => void;
  onClose: () => void;
  initialTreatment?: Treatment | null;
  defaultSelectedToothIds?: number[];
}

const TreatmentForm: React.FC<TreatmentFormProps> = ({ patient, onSubmit, onClose, initialTreatment, defaultSelectedToothIds = [] }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedToothIds, setSelectedToothIds] = useState<number[]>([]);
  const [procedure, setProcedure] = useState('');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState<number | ''>('');
  const [newStatusForSelectedTeeth, setNewStatusForSelectedTeeth] = useState<ToothStatus | ''>('');

  useEffect(() => {
    if (initialTreatment) {
      setDate(initialTreatment.date.split('T')[0]);
      setSelectedToothIds(initialTreatment.toothIds);
      setProcedure(initialTreatment.procedure);
      setNotes(initialTreatment.notes || '');
      setCost(initialTreatment.cost || '');
    } else {
        setSelectedToothIds(defaultSelectedToothIds);
        setDate(new Date().toISOString().split('T')[0]);
        setProcedure('');
        setNotes('');
        setCost('');
        setNewStatusForSelectedTeeth('');
    }
  }, [initialTreatment, defaultSelectedToothIds]);

  const handleToothSelection = (toothId: number) => {
    setSelectedToothIds(prev =>
      prev.includes(toothId) ? prev.filter(id => id !== toothId) : [...prev, toothId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedToothIds.length === 0 || !procedure) {
      alert("Mohon pilih minimal satu gigi dan isi deskripsi prosedur.");
      return;
    }

    const treatmentData: Treatment = {
      id: initialTreatment ? initialTreatment.id : crypto.randomUUID(),
      date: new Date(date).toISOString(),
      toothIds: selectedToothIds,
      procedure,
      notes,
      cost: cost === '' ? undefined : Number(cost),
    };

    let updatedPatientTeeth = [...patient.teeth];
    if (newStatusForSelectedTeeth) {
        updatedPatientTeeth = patient.teeth.map(tooth => 
            selectedToothIds.includes(tooth.id) ? { ...tooth, status: newStatusForSelectedTeeth } : tooth
        );
    }
    
    onSubmit(treatmentData, updatedPatientTeeth);
  };
  
  const availableTeeth = patient.teeth.filter(t => t.status !== ToothStatus.Missing && t.status !== ToothStatus.Extracted);
  const inputBaseClass = "mt-1 block w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors";


  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-0.5">Tanggal Perawatan</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputBaseClass}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-0.5">Gigi yang Dirawat</label>
        <div className="mt-1 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 p-3 border border-gray-300 rounded-lg max-h-48 overflow-y-auto bg-slate-50">
          {availableTeeth.map(tooth => (
            <button
              type="button"
              key={tooth.id}
              onClick={() => handleToothSelection(tooth.id)}
              className={`p-2.5 rounded-md text-sm font-medium border transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                selectedToothIds.includes(tooth.id)
                  ? 'bg-primary text-white border-primary-dark ring-primary'
                  : 'bg-white text-gray-700 hover:bg-indigo-50 border-gray-300 hover:border-indigo-300 ring-transparent'
              }`}
              title={`${tooth.id}: ${tooth.name}`}
            >
              {tooth.id}
            </button>
          ))}
        </div>
        {selectedToothIds.length > 0 && 
            <p className="text-xs text-gray-600 mt-1.5">Terpilih: {selectedToothIds.sort((a,b) => a-b).join(', ')}</p>
        }
      </div>
      <div>
        <label htmlFor="procedure" className="block text-sm font-medium text-gray-700 mb-0.5">Prosedur/Tindakan</label>
        <input
          type="text"
          id="procedure"
          value={procedure}
          onChange={(e) => setProcedure(e.target.value)}
          placeholder="e.g., Penambalan Komposit, Ekstraksi"
          className={inputBaseClass}
          required
        />
      </div>
       <div>
        <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 mb-0.5">Ubah Status Gigi Terpilih Menjadi (Opsional)</label>
        <select
          id="newStatus"
          value={newStatusForSelectedTeeth}
          onChange={(e) => setNewStatusForSelectedTeeth(e.target.value as ToothStatus | '')}
          className={`${inputBaseClass} bg-white`}
        >
          <option value="">-- Tidak mengubah status --</option>
          {TOOTH_STATUS_OPTIONS.map((opt: OptionType) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
         <p className="text-xs text-gray-500 mt-1">Jika diisi, status semua gigi terpilih akan diubah.</p>
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-0.5">Catatan Tambahan (Opsional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={inputBaseClass}
        />
      </div>
      <div>
        <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-0.5">Biaya (Rp) (Opsional)</label>
        <input
          type="number"
          id="cost"
          value={cost}
          onChange={(e) => setCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
          placeholder="e.g., 500000"
          className={inputBaseClass}
        />
      </div>
      <div className="flex justify-end space-x-3 pt-3">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 border border-transparent rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 transition-all"
        >
          {initialTreatment ? 'Simpan Perawatan' : 'Tambah Perawatan'}
        </button>
      </div>
    </form>
  );
};

export default TreatmentForm;
