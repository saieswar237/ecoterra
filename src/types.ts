export interface EcoAction {
  id: string;
  name: string;
  impact: number; // Positive is helpful, negative is harmful
  category: 'transport' | 'food' | 'energy' | 'waste' | 'conservation' | 'custom';
  description: string;
}

export interface LoggedAction {
  id: string;
  actionId: string;
  name: string;
  impact: number;
  category: string;
  timestamp: string;
  note?: string;
}

export type IslandState = 'optimal' | 'moderate' | 'degraded';
