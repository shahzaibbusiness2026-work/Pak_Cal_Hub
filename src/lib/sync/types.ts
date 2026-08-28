export interface SyncItemChange {
  key: string;
  label: string;
  category: string;
  oldValue: number;
  newValue: number;
  difference: number;
  percentChange: number;
  unit: string;
  source: string;
  status: 'UPDATED' | 'UNCHANGED' | 'FAILED' | 'PENDING_REVIEW';
}

export interface SyncServiceResult {
  service: 'fuel' | 'gold' | 'currency' | 'electricity' | 'government';
  success: boolean;
  timestamp: string;
  itemsProcessed: number;
  changesDetected: number;
  changes: SyncItemChange[];
  message: string;
  error?: string;
}

export interface SyncOptions {
  forceUpdate?: boolean;
  sourceOverride?: string;
  adminUser?: string;
}
