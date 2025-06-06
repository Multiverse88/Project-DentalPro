
import React from 'react';
import { Tooth } from '../types';
import ToothComponent from './ToothComponent';

interface DentalChartProps {
  teeth: Tooth[];
  selectedToothIds: number[];
  onToothClick: (toothId: number) => void;
}

const DentalChart: React.FC<DentalChartProps> = ({ teeth, selectedToothIds, onToothClick }) => {
  const renderQuadrant = (quadrantName: 'UR' | 'UL' | 'LR' | 'LL') => {
    let filteredTeeth = teeth.filter(t => t.quadrant === quadrantName);
    // Sort teeth for consistent display
    if (quadrantName === 'UR' || quadrantName === 'LR') { // Right side, numbers decrease towards midline
      filteredTeeth = filteredTeeth.sort((a, b) => b.id - a.id); 
    } else { // Left side, numbers increase away from midline
      filteredTeeth = filteredTeeth.sort((a, b) => a.id - b.id);
    }

    return (
      <div className="flex">
        {filteredTeeth.map(tooth => (
          <ToothComponent
            key={tooth.id}
            tooth={tooth}
            onClick={onToothClick}
            isSelected={selectedToothIds.includes(tooth.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">Dental Chart</h3>
      <div className="flex flex-col items-center space-y-1 select-none">
        {/* Upper Jaw */}
        <div className="flex justify-center w-full">
          <div className="flex">
            {renderQuadrant('UR')}
          </div>
          <div className="border-l-2 border-slate-300 h-16 mx-1"></div> {/* Midline separator */}
          <div className="flex">
            {renderQuadrant('UL')}
          </div>
        </div>
        
        {/* Midline horizontal separator */}
        <div className="border-t-2 border-slate-300 w-full max-w-md my-1"></div>

        {/* Lower Jaw */}
        <div className="flex justify-center w-full">
          <div className="flex">
            {renderQuadrant('LR')}
          </div>
          <div className="border-l-2 border-slate-300 h-16 mx-1"></div> {/* Midline separator */}
          <div className="flex">
            {renderQuadrant('LL')}
          </div>
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-500 text-center">
        Universal Numbering System (UNS). Click on a tooth to select/deselect.
      </div>
    </div>
  );
};

export default DentalChart;
    