
import React from 'react';
import { ToothStatus } from '../types';

interface ToothIconProps {
  status: ToothStatus;
  size?: number;
  isSelected?: boolean;
}

const ToothIcon: React.FC<ToothIconProps> = ({ status, size = 24, isSelected = false }) => {
  const statusColors: Record<ToothStatus, string> = {
    [ToothStatus.Healthy]: 'fill-white',
    [ToothStatus.Decay]: 'fill-yellow-400', // Consider a less vibrant yellow or a specific "decay" color
    [ToothStatus.Filled]: 'fill-gray-400',
    [ToothStatus.Extracted]: 'fill-red-500 opacity-50', 
    [ToothStatus.RootCanal]: 'fill-purple-400', // Consider aligning with theme, e.g., a shade of blue/indigo
    [ToothStatus.Crown]: 'fill-amber-300', // Was yellow-200, amber is a bit richer
    [ToothStatus.Missing]: 'fill-slate-300 opacity-50',
  };

  const baseStroke = isSelected ? 'stroke-primary' : 'stroke-gray-600'; // Use theme primary for selected
  const strokeWidth = isSelected ? 2.2 : 1.5; // Slightly thicker selected stroke

  if (status === ToothStatus.Extracted || status === ToothStatus.Missing) {
    return (
      <div 
        className={`flex items-center justify-center bg-slate-200 rounded-md ${isSelected ? 'ring-2 ring-primary' : ''}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      > 
        <title>{status}</title> {/* Accessibility: title for the div */}
        {status === ToothStatus.Extracted && <span className="text-red-600 text-sm font-bold">X</span>}
        {status === ToothStatus.Missing && <span className="text-slate-500 text-sm font-semibold">-</span>}
      </div>
    );
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={`${statusColors[status]} ${baseStroke}`}
      strokeWidth={strokeWidth}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Tooth status: ${status}`} // Accessibility
    >
      <title>{status}</title> 
      {/* Simplified tooth shape */}
      <path 
        d="M6 3 C4 3 3 4 3 6 L3 10 C3 12 4 14 6 14 L7 14 C7 16 8 18 10 18 L14 18 C16 18 17 16 17 14 L18 14 C20 14 21 12 21 10 L21 6 C21 4 20 3 18 3 Z M7 6 L17 6 L17 10 L7 10 Z" 
        strokeLinejoin="round" 
        strokeLinecap="round"
      />
      {/* Roots (simplified) */}
      <path d="M8 18 L8 21 L10 21 L10 18 M14 18 L14 21 L16 21 L16 18" strokeLinejoin="round" strokeLinecap="round" />
       {status === ToothStatus.Filled && <circle cx="12" cy="8" r="2.5" className="fill-slate-500 stroke-slate-600" strokeWidth="0.5" />}
       {status === ToothStatus.Decay && <circle cx="12" cy="8" r="2.5" className="fill-black opacity-60" />}
       {status === ToothStatus.RootCanal && <line x1="12" y1="5" x2="12" y2="20" className="stroke-red-500" strokeWidth="1.2"/>}
       {/* Crown could have a slightly different top surface or thicker outline if needed */}
       {status === ToothStatus.Crown && <rect x="5" y="4" width="14" height="8" rx="2" className="fill-amber-300 stroke-amber-500" strokeWidth="0.5"/>}

    </svg>
  );
};

export default ToothIcon;
