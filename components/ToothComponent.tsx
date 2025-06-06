
import React from 'react';
import { Tooth, ToothStatus } from '../types';
import ToothIcon from './ToothIcon';

interface ToothComponentProps {
  tooth: Tooth;
  onClick: (toothId: number) => void;
  isSelected?: boolean;
  showNumber?: boolean;
}

const ToothComponent: React.FC<ToothComponentProps> = ({ tooth, onClick, isSelected = false, showNumber = true }) => {
  const { id, status } = tooth;

  const handleClick = () => {
    if (status !== ToothStatus.Extracted && status !== ToothStatus.Missing) {
      onClick(id);
    }
  };
  
  const isDisabled = status === ToothStatus.Extracted || status === ToothStatus.Missing;
  const cursorClass = isDisabled ? 'cursor-not-allowed' : 'cursor-pointer';

  return (
    <div
      onClick={handleClick}
      role="button"
      aria-pressed={isSelected && !isDisabled}
      aria-label={`Gigi ${id}: ${tooth.name} - Status: ${status}${isDisabled ? ' (Tidak dapat dipilih)' : ''}`}
      title={`${id}: ${tooth.name} - ${status}`}
      className={`flex flex-col items-center justify-center p-1.5 m-0.5 rounded-lg transition-all duration-150 ease-in-out min-w-[48px] ${cursorClass} ${
        isSelected && !isDisabled ? 'bg-indigo-100 ring-2 ring-primary' : 'bg-slate-50 hover:bg-slate-200'
      } ${isDisabled ? 'opacity-50' : ''}`}
    >
      {showNumber && <span className="text-xs font-medium text-gray-700 select-none mb-0.5">{id}</span>}
      <ToothIcon status={status} size={30} isSelected={isSelected && !isDisabled} />
    </div>
  );
};

export default ToothComponent;
