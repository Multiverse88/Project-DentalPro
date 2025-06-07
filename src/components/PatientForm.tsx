
import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { getDefaultTeeth, GENDER_OPTIONS } from '../constants';

interface PatientFormProps {
  onSubmit: (patient: Patient) => void;
  onClose: () => void;
  initialData?: Patient | null;
  isSubmitting?: boolean;
}

const PatientForm: React.FC<PatientFormProps> = ({ onSubmit, onClose, initialData, isSubmitting = false }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDob(initialData.dob.split('T')[0]); // Format for date input
      setGender(initialData.gender);
      setContact(initialData.contact);
      setAddress(initialData.address || '');
    } else {
      setName('');
      setDob('');
      setGender('Male');
      setContact('');
      setAddress('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dob || !contact) {
      alert("Nama, Tanggal Lahir, dan Kontak wajib diisi.");
      return;
    }
    
    const patientData: Patient = initialData ? {
      ...initialData,
      name,
      dob: new Date(dob).toISOString(),
      gender,
      contact,
      address,
    } : {
      id: crypto.randomUUID(), 
      name,
      dob: new Date(dob).toISOString(),
      gender,
      contact,
      address,
      teeth: getDefaultTeeth(), 
      treatments: [], 
      createdAt: new Date().toISOString(), 
    };
    onSubmit(patientData);
  };

  const inputBaseClass = "mt-1 block w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-0.5">Nama Pasien</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputBaseClass}
          required
          aria-required="true"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-0.5">Tanggal Lahir</label>
        <input
          type="date"
          id="dob"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className={inputBaseClass}
          required
          aria-required="true"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-0.5">Jenis Kelamin</label>
        <select
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
          className={`${inputBaseClass} bg-white`}
          disabled={isSubmitting}
        >
          {GENDER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-0.5">Kontak (Telepon/Email)</label>
        <input
          type="text"
          id="contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className={inputBaseClass}
          required
          aria-required="true"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-0.5">Alamat (Opsional)</label>
        <textarea
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          className={inputBaseClass}
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
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark border border-transparent rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary transition-all disabled:opacity-70"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </span>
          ) : (initialData ? 'Simpan Perubahan' : 'Tambah Pasien')}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;
