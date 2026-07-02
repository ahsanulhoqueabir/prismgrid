/** Represents a row in the `device_states` table (realtime-enabled, one row per profile) */
export interface DeviceState {
  id: string;
  profile: string; // FK → profiles.id
  voltage: number;
  current: number;
  power: number;
  frequency: number;
  energy: number;
  state: boolean; // true = ON, false = OFF
  created_at: string;
}

/** Represents a row in the `device_history` table (append-only log) */
export interface DeviceHistory {
  id: string;
  profile: string; // FK → profiles.id
  voltage: number;
  current: number;
  power: number;
  frequency: number;
  energy: number;
  state: boolean;
  created_at: string;
}

/** Payload for updating device state (unprotected — profile in body) */
export interface UpdateDeviceStatePayload {
  profile: string;
  voltage: number;
  current: number;
  power: number;
  frequency: number;
  energy: number;
  state: boolean;
}

/** Payload for inserting a device history record (unprotected — profile in body) */
export interface InsertDeviceHistoryPayload {
  profile: string;
  voltage: number;
  current: number;
  power: number;
  frequency: number;
  energy: number;
  state: boolean;
}

/** Query params for fetching history */
export interface HistoryQueryParams {
  profile: string;
  range?: "last_hour" | "last_week" | "custom";
  from?: string; // ISO date string, required when range=custom
  to?: string; // ISO date string, required when range=custom
}

// ─── Derived / Display Types ───────────────────────────────────────────────

/** Safety evaluation result */
export interface SafetyStatus {
  status: "safe" | "warning" | "danger" | "cutoff" | "unknown";
  message: string;
}

/** Voltage analysis result */
export interface VoltageAnalysis {
  isNominal: boolean;
  isFluctuating: boolean;
  statusText: string;
  statusColor: string;
}

/** Current analysis result */
export interface CurrentAnalysis {
  statusText: string;
  statusColor: string;
}

/** Power analysis result */
export interface PowerAnalysis {
  statusText: string;
  statusColor: string;
}

/** Frequency analysis result */
export interface FrequencyAnalysis {
  statusText: string;
  statusColor: string;
}

/** Compiled device analysis from history */
export interface DeviceAnalysis {
  voltageSpikes: number;
  currentSpikes: number;
  maxPower: number;
  maxPowerTime: string;
  peakHour: string;
  energyUsed: number;
  estimatedCost: number;
}

/** A single chart data point */
export interface ChartDataPoint {
  time: string;
  voltage: number;
  current: number;
  power: number;
  energy: number;
  frequency: number;
}
