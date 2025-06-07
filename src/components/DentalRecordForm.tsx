
import React, { useState, useEffect } from 'react';
import { DentalRecord, Patient, Tooth, ToothStatus } from '../types';

interface DentalRecordFormProps {
  patient: Patient;
  onSubmit: (recordData: Omit<DentalRecord, 'id'>) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

const DentalRecordForm: React.FC<DentalRecordFormProps> = ({ patient, onSubmit, onClose, isSubmitting = false }) => {
  const [toothNumber, setToothNumber] = useState<number | ''>('');
  const [treatmentDate, setTreatmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [treatmentType, setTreatmentType] = useState('');

  const availableTeeth = patient.teeth.filter(t => t.status !== ToothStatus.Missing && t.status !== ToothStatus.Extracted)
                             .sort((a, b) => a.id - b.id);

  useEffect(() => {
    // Pre-select first available tooth if list is not empty
    if (availableTeeth.length > 0 && toothNumber === '') {
      // setToothNumber(availableTeeth[0].id); // Optionally pre-select
    }
  }, [availableTeeth, toothNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (toothNumber === '' || !treatmentDate || !description || !treatmentType) {
      alert("Mohon lengkapi semua field: Nomor Gigi, Tanggal, Jenis Perawatan, dan Deskripsi.");
      return;
    }

    const recordData: Omit<DentalRecord, 'id'> = {
      tooth_number: Number(toothNumber),
      treatment_date: new Date(treatmentDate).toISOString(),
      description,
      treatment_type: treatmentType,
    };
    onSubmit(recordData);
  };

  const inputBaseClass = "mt-1 block w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="toothNumber" className="block text-sm font-medium text-gray-700 mb-0.5">Nomor Gigi</label>
        <select
          id="toothNumber"
          value={toothNumber}
          onChange={(e) => setToothNumber(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
          className={`${inputBaseClass} bg-white`}
          required
          disabled={isSubmitting || availableTeeth.length === 0}
        >
          <option value="">-- Pilih Gigi --</option>
          {availableTeeth.map(tooth => (
            <option key={tooth.id} value={tooth.id}>
              {tooth.id} - {tooth.name} ({tooth.status})
            </option>
          ))}
        </select>
        {availableTeeth.length === 0 && <p className="text-xs text-red-500 mt-1">Tidak ada gigi yang dapat dipilih untuk pasien ini.</p>}
      </div>

      <div>
        <label htmlFor="treatmentDate" className="block text-sm font-medium text-gray-700 mb-0.5">Tanggal Perawatan</label>
        <input
          type="date"
          id="treatmentDate"
          value={treatmentDate}
          onChange={(e) => setTreatmentDate(e.target.value)}
          className={inputBaseClass}
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="treatmentType" className="block text-sm font-medium text-gray-700 mb-0.5">Jenis Perawatan</label>
        <input
          type="text"
          id="treatmentType"
          value={treatmentType}
          onChange={(e) => setTreatmentType(e.target.value)}
          placeholder="e.g., Scaling, Pemeriksaan Rutin"
          className={inputBaseClass}
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-0.5">Deskripsi</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Detail catatan atau observasi..."
          className={inputBaseClass}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 transition-colors disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting || availableTeeth.length === 0}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 border border-transparent rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 transition-all disabled:opacity-70"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </span>
          ) : 'Tambah Catatan'}
        </button>
      </div>
    </form>
  );
};

export default DentalRecordForm;
