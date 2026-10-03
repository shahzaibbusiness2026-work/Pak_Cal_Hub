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
  /**
   * How the rates were obtained. 'live-fetch' only when a genuine official
   * feed is polled; 'manual-verified' when the pipeline publishes manually
   * verified constants (the honest mode for OGRA/SBP/Sarafa, which expose
   * no public machine-readable feed).
   */
  syncMode?: 'live-fetch' | 'manual-verified';
  /** ISO date the published constants were last manually verified. */
  verifiedOn?: string;
}

export interface SyncOptions {
  forceUpdate?: boolean;
  sourceOverride?: string;
  adminUser?: string;
}
