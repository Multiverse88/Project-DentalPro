
import React from 'react';
import { DentalRecord } from '../types';

interface DentalRecordListProps {
  dentalRecords: DentalRecord[];
}

const DentalRecordList: React.FC<DentalRecordListProps> = ({ dentalRecords }) => {
  if (dentalRecords.length === 0) {
    return (
      <div className="text-center py-8">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 text-gray-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p className="text-gray-600 text-lg">Belum ada catatan dental.</p>
        <p className="text-sm text-gray-500 mt-1">Tambahkan catatan dental untuk melihatnya di sini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No. Gigi</th>
              <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
              <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jenis Perawatan</th>
              <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Deskripsi</th>
              {/* No actions like edit/delete specified for dental records in this iteration */}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {dentalRecords.sort((a,b) => new Date(b.treatment_date).getTime() - new Date(a.treatment_date).getTime()).map(record => (
              <tr key={record.id} className="hover:bg-gray-50/70 transition-colors duration-150">
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    <span className="inline-block bg-sky-100 text-sky-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {record.tooth_number}
                    </span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                  {new Date(record.treatment_date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}
                </td>
                <td className="px-5 py-4 text-sm text-gray-800 font-medium">{record.treatment_type}</td>
                <td className="px-5 py-4 text-sm text-gray-600 max-w-md">
                   <p className="whitespace-pre-wrap">{record.description || <span className="text-gray-400">-</span>}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DentalRecordList;
