import Dexie, { Table } from 'dexie';

export interface AuthState {
  id?: number;
  pinHash: string;
  lastLogin: Date;
  sessionExpiry: Date;
}

export interface ScanRecord {
  id?: string;
  timestamp: Date;
  imageDataUrl: string;
  ocrStructured: OCRResponse;
  edited: boolean;
  tokenUsage: TokenUsage;
}

export interface OCRResponse {
  title?: string;
  fields?: OCRField[];
  sizes?: OCRSize[];
  raw_text?: string;
  notes?: string[];
}

export interface OCRField {
  field: string;
  value: string;
  confidence?: 'high' | 'medium' | 'low';
}

export interface OCRSize {
  size: string;
  quantity: number;
}

export interface TokenUsage {
  input: number;
  output: number;
  cost: number;
}

export interface AnalyticsCache {
  id?: number;
  totalScans: number;
  scansToday: number;
  scansThisWeek: number;
  topProducts: Array<{ name: string; count: number }>;
  lastUpdated: Date;
}

export class OCRDatabase extends Dexie {
  auth!: Table<AuthState, number>;
  scans!: Table<ScanRecord, string>;
  analytics!: Table<AnalyticsCache, number>;

  constructor() {
    super('OCRDatabase');
    this.version(1).stores({
      auth: '++id',
      scans: 'id, timestamp, edited',
      analytics: '++id',
    });
  }
}

export const db = new OCRDatabase();