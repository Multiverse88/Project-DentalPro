
import React from 'react';
import { Treatment, Tooth } from '../types';

interface TreatmentHistoryProps {
  treatments: Treatment[];
  teeth: Tooth[]; 
  onEditTreatment: (treatment: Treatment) => void;
  onDeleteTreatment: (treatmentId: string) => void;
  isSubmitting?: boolean; // Optional: to disable buttons during other operations
}

const TreatmentHistory: React.FC<TreatmentHistoryProps> = ({ treatments, teeth, onEditTreatment, onDeleteTreatment, isSubmitting = false }) => {
  if (treatments.length === 0) {
    return (
      <div className="text-center py-8">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 text-gray-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p className="text-gray-600 text-lg">Belum ada riwayat perawatan.</p>
        <p className="text-sm text-gray-500 mt-1">Tambahkan perawatan untuk melihat riwayatnya di sini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
              <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gigi</th>
              <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prosedur</th>
              <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Catatan</th>
              <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Biaya</th>
              <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {treatments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(treatment => (
              <tr key={treatment.id} className={`hover:bg-gray-50/70 transition-colors duration-150 ${isSubmitting ? 'opacity-70' : ''}`}>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(treatment.date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}</td>
                <td className="px-5 py-4 text-sm text-gray-700">
                  <div className="flex flex-wrap gap-1">
                  {treatment.toothIds.sort((a,b) => a-b).map(id => (
                    <span key={id} className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {id}
                    </span>
                  ))}
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-800 font-medium">{treatment.procedure}</td>
                <td className="px-5 py-4 text-sm text-gray-600 max-w-xs" title={treatment.notes}>
                  <p className="truncate w-full">{treatment.notes || <span className="text-gray-400">-</span>}</p>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                  {treatment.cost !== undefined ? `Rp ${treatment.cost.toLocaleString('id-ID')}` : <span className="text-gray-400">-</span>}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm space-x-3">
                  <button 
                    onClick={() => onEditTreatment(treatment)}
                    disabled={isSubmitting}
                    className="text-primary hover:text-primary-dark font-medium hover:underline focus:outline-none focus:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                    aria-label={`Edit perawatan tanggal ${new Date(treatment.date).toLocaleDateString()}`}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                        // Confirmation is now handled in App.tsx to keep API logic centralized
                        onDeleteTreatment(treatment.id);
                    }}
                    disabled={isSubmitting}
                    className="text-red-600 hover:text-red-800 font-medium hover:underline focus:outline-none focus:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                    aria-label={`Hapus perawatan tanggal ${new Date(treatment.date).toLocaleDateString()}`}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TreatmentHistory;
