export interface FormationSlot {
  label: string;
  position: string;
  row: number;
}

export const FORMATION_442: FormationSlot[] = [
  // Row 0: Goalkeeper
  { label: 'GK', position: 'GK', row: 0 },

  // Row 1: Defenders
  { label: 'DL', position: 'DL', row: 1 },
  { label: 'DC', position: 'DC', row: 1 },
  { label: 'DC', position: 'DC', row: 1 },
  { label: 'DR', position: 'DR', row: 1 },

  // Row 2: Midfielders
  { label: 'ML', position: 'ML', row: 2 },
  { label: 'MC', position: 'MC', row: 2 },
  { label: 'MC', position: 'MC', row: 2 },
  { label: 'MR', position: 'MR', row: 2 },

  // Row 3: Strikers
  { label: 'ST', position: 'ST', row: 3 },
  { label: 'ST', position: 'ST', row: 3 }
];
