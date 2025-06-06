
import React from 'react';
import { Patient } from '../types';

interface PatientListItemProps {
  patient: Patient;
  onSelectPatient: (patientId: string) => void;
  onEditPatient: (patient: Patient) => void;
}

const PatientListItem: React.FC<PatientListItemProps> = ({ patient, onSelectPatient, onEditPatient }) => {
  return (
    <li 
      className="bg-white p-5 sm:p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 ease-in-out flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      role="button"
      tabIndex={0}
      onClick={() => onSelectPatient(patient.id)}
      onKeyPress={(e) => e.key === 'Enter' && onSelectPatient(patient.id)}
    >
      <div className="flex-grow">
        <h3 className="text-xl font-semibold text-primary-dark group-hover:text-primary-dark transition-colors">{patient.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5 mb-1.5">ID: {patient.id.substring(0,8)}</p>
        <div className="text-sm text-gray-600 space-y-0.5 sm:space-y-0 sm:flex sm:space-x-3">
          <span>
            TTL: {new Date(patient.dob).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
          <span className="hidden sm:inline">|</span>
          <span>Kontak: {patient.contact}</span>
        </div>
      </div>
      <div className="flex-shrink-0 flex sm:flex-col md:flex-row items-stretch sm:items-end md:items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
         <button
          onClick={(e) => { e.stopPropagation(); onEditPatient(patient); }}
          className="w-full md:w-auto px-4 py-2 text-sm font-medium text-secondary-dark bg-sky-100 hover:bg-sky-200 border border-transparent hover:border-sky-300 rounded-lg shadow-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50"
          aria-label={`Edit informasi pasien ${patient.name}`}
        >
          Edit Info
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onSelectPatient(patient.id); }}
          className="w-full md:w-auto px-4 py-2 text-sm font-medium text-white bg-primary-light hover:bg-primary rounded-lg shadow-sm hover:shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          aria-label={`Lihat detail pasien ${patient.name}`}
        >
          Lihat Detail
        </button>
      </div>
    </li>
  );
};

export default PatientListItem;
