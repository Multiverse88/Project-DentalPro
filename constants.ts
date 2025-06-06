import { Tooth, ToothStatus } from './types';

const TOOTH_NAMES_UNS: { [key: number]: { name: string, quadrant: 'UR' | 'UL' | 'LR' | 'LL' } } = {
  // Upper Right (Kanan Atas)
  1: { name: "Gigi Bungsu Kanan Atas", quadrant: 'UR' }, 
  2: { name: "Geraham Kedua Kanan Atas", quadrant: 'UR' }, 
  3: { name: "Geraham Pertama Kanan Atas", quadrant: 'UR' },
  4: { name: "Premolar Kedua Kanan Atas", quadrant: 'UR' }, 
  5: { name: "Premolar Pertama Kanan Atas", quadrant: 'UR' }, 
  6: { name: "Gigi Taring Kanan Atas", quadrant: 'UR' },
  7: { name: "Gigi Seri Lateral Kanan Atas", quadrant: 'UR' }, 
  8: { name: "Gigi Seri Tengah Kanan Atas", quadrant: 'UR' },
  // Upper Left (Kiri Atas)
  9: { name: "Gigi Seri Tengah Kiri Atas", quadrant: 'UL' }, 
  10: { name: "Gigi Seri Lateral Kiri Atas", quadrant: 'UL' }, 
  11: { name: "Gigi Taring Kiri Atas", quadrant: 'UL' },
  12: { name: "Premolar Pertama Kiri Atas", quadrant: 'UL' }, 
  13: { name: "Premolar Kedua Kiri Atas", quadrant: 'UL' },
  14: { name: "Geraham Pertama Kiri Atas", quadrant: 'UL' }, 
  15: { name: "Geraham Kedua Kiri Atas", quadrant: 'UL' }, 
  16: { name: "Gigi Bungsu Kiri Atas", quadrant: 'UL' },
  // Lower Left (Kiri Bawah)
  17: { name: "Gigi Bungsu Kiri Bawah", quadrant: 'LL' }, 
  18: { name: "Geraham Kedua Kiri Bawah", quadrant: 'LL' }, 
  19: { name: "Geraham Pertama Kiri Bawah", quadrant: 'LL' },
  20: { name: "Premolar Kedua Kiri Bawah", quadrant: 'LL' }, 
  21: { name: "Premolar Pertama Kiri Bawah", quadrant: 'LL' }, 
  22: { name: "Gigi Taring Kiri Bawah", quadrant: 'LL' },
  23: { name: "Gigi Seri Lateral Kiri Bawah", quadrant: 'LL' }, 
  24: { name: "Gigi Seri Tengah Kiri Bawah", quadrant: 'LL' },
  // Lower Right (Kanan Bawah)
  25: { name: "Gigi Seri Tengah Kanan Bawah", quadrant: 'LR' }, 
  26: { name: "Gigi Seri Lateral Kanan Bawah", quadrant: 'LR' }, 
  27: { name: "Gigi Taring Kanan Bawah", quadrant: 'LR' },
  28: { name: "Premolar Pertama Kanan Bawah", quadrant: 'LR' }, 
  29: { name: "Premolar Kedua Kanan Bawah", quadrant: 'LR' },
  30: { name: "Geraham Pertama Kanan Bawah", quadrant: 'LR' }, 
  31: { name: "Geraham Kedua Kanan Bawah", quadrant: 'LR' }, 
  32: { name: "Gigi Bungsu Kanan Bawah", quadrant: 'LR' },
};

export const getDefaultTeeth = (): Tooth[] => {
  const teeth: Tooth[] = [];
  for (let i = 1; i <= 32; i++) {
    const toothInfo = TOOTH_NAMES_UNS[i];
    teeth.push({
      id: i,
      name: toothInfo.name,
      quadrant: toothInfo.quadrant,
      status: ToothStatus.Healthy,
    });
  }
  return teeth;
};


export const TOOTH_STATUS_OPTIONS = Object.values(ToothStatus).map(status => ({
  value: status,
  label: status.replace(/([A-Z])/g, ' $1').trim(), // Add space before capitals
}));

export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Laki-laki' },
  { value: 'Female', label: 'Perempuan' },
  { value: 'Other', label: 'Lainnya' },
];

export const ANATOMICAL_LABELS_PATIENT_RIGHT_UPPER_ID = [
  { representativeToothId: 8, label: "Gigi Seri Depan" },
  { representativeToothId: 7, label: "Gigi Seri Lateral" },
  { representativeToothId: 6, label: "Gigi Taring" },
  { representativeToothId: 5, label: "Gigi Premolar Pertama" },
  { representativeToothId: 4, label: "Gigi Premolar Kedua" },
  { representativeToothId: 3, label: "Gigi Geraham Pertama" },
  { representativeToothId: 2, label: "Gigi Geraham Kedua" },
  { representativeToothId: 1, label: "Gigi Geraham Bungsu" },
];

export const ANATOMICAL_LABELS_PATIENT_RIGHT_LOWER_ID = [
  { representativeToothId: 25, label: "Gigi Seri Depan" },
  { representativeToothId: 26, label: "Gigi Seri Lateral" },
  { representativeToothId: 27, label: "Gigi Taring" },
  { representativeToothId: 28, label: "Gigi Premolar Pertama" },
  { representativeToothId: 29, label: "Gigi Premolar Kedua" },
  { representativeToothId: 30, label: "Gigi Geraham Pertama" },
  { representativeToothId: 31, label: "Gigi Geraham Kedua" },
  { representativeToothId: 32, label: "Gigi Geraham Bungsu" },
];