
import React from 'react';
import { Tooth, ToothStatus, OptionType } from '../types';
import { TOOTH_STATUS_OPTIONS } from '../constants';

interface ToothActionsPopoverProps {
  tooth: Tooth | null;
  onSetStatus: (toothId: number, status: ToothStatus) => void;
  onAddDetailedTreatment: (toothId: number) => void;
  onClose: () => void;
  position: { top: number; left: number } | null;
}

const ToothActionsPopover: React.FC<ToothActionsPopoverProps> = ({ tooth, onSetStatus, onAddDetailedTreatment, onClose, position }) => {
  if (!tooth || !position) return null;

  const handleStatusChange = (status: ToothStatus) => {
    onSetStatus(tooth.id, status);
    onClose();
  };

  const handleAddTreatment = () => {
    onAddDetailedTreatment(tooth.id);
    onClose();
  };

  return (
    <div
      className="absolute z-30 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-64 transform transition-all duration-100 ease-out"
      style={{ top: position.top, left: position.left }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popover-title"
    >
      <div className="flex justify-between items-center mb-3">
        <h4 id="popover-title" className="text-base font-semibold text-gray-800">
          Gigi #{tooth.id} <span className="text-gray-500 font-normal text-sm">({tooth.name})</span>
        </h4>
        <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Tutup popover"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-3">Status Saat Ini: <span className="font-medium text-gray-700">{tooth.status.replace(/([A-Z])/g, ' $1').trim()}</span></p>
      
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-600 mb-1">Ubah Status Cepat:</label>
        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {TOOTH_STATUS_OPTIONS.map((opt: OptionType) => (
            <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value as ToothStatus)}
                className="w-full text-left px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary"
            >
                Tandai sebagai {opt.label}
            </button>
            ))}
        </div>
        <hr className="my-3 border-gray-200"/>
        <button
          onClick={handleAddTreatment}
          className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Tambah Riwayat Perawatan
        </button>
      </div>
    </div>
  );
};

export default ToothActionsPopover;
