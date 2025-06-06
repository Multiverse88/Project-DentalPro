
import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { getDefaultTeeth, GENDER_OPTIONS } from '../constants';

interface PatientFormProps {
  onSubmit: (patient: Patient) => void;
  onClose: () => void;
  initialData?: Patient | null;
}

const PatientForm: React.FC<PatientFormProps> = ({ onSubmit, onClose, initialData }) => {
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
      // Reset form for new patient
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
    
    const patientData: Patient = {
      id: initialData ? initialData.id : crypto.randomUUID(),
      name,
      dob: new Date(dob).toISOString(),
      gender,
      contact,
      address,
      teeth: initialData ? initialData.teeth : getDefaultTeeth(),
      treatments: initialData ? initialData.treatments : [],
      createdAt: initialData ? initialData.createdAt : new Date().toISOString(),
    };
    onSubmit(patientData);
  };

  const inputBaseClass = "mt-1 block w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors";

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
        />
      </div>
      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-0.5">Jenis Kelamin</label>
        <select
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
          className={`${inputBaseClass} bg-white`}
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
          className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark border border-transparent rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary transition-all"
        >
          {initialData ? 'Simpan Perubahan' : 'Tambah Pasien'}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;
