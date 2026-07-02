import type { DeviceState, DeviceHistory } from "@/types/db/device.types";

// ─── Safety Status ─────────────────────────────────────────────────────────

export interface SafetyStatus {
  status: "safe" | "warning" | "danger" | "cutoff" | "unknown";
  message: string;
}

/**
 * Evaluate the safety status of a device based on its current telemetry.
 */
export function getDeviceSafetyStatus(
  deviceState: DeviceState | null,
): SafetyStatus {
  if (!deviceState)
    return {
      status: "unknown",
      message:
        "Hardware telemetry node offline. Waiting for sensor handshake...",
    };
  if (!deviceState.state)
    return {
      status: "cutoff",
      message: "Relay cutoff active. App power disconnected for protection.",
    };
  if (deviceState.voltage > 245)
    return {
      status: "danger",
      message: "CRITICAL: Over-voltage hazard! Protecting hardware load.",
    };
  if (deviceState.voltage < 185)
    return {
      status: "danger",
      message: "CRITICAL: Under-voltage brownout! Heavy loads suspended.",
    };
  if (deviceState.current > 10)
    return {
      status: "danger",
      message:
        "CRITICAL: Over-current load limit breached! Auto-shutoff armed.",
    };
  if (deviceState.voltage > 240 || deviceState.voltage < 195)
    return {
      status: "warning",
      message:
        "WARNING: Mild voltage fluctuations. Actively monitoring anomalies.",
    };
  return {
    status: "safe",
    message:
      "Grid normal. System fully active, protected, and feeding metrics.",
  };
}

// ─── Voltage Analysis ──────────────────────────────────────────────────────

export interface VoltageAnalysis {
  isNominal: boolean;
  isFluctuating: boolean;
  statusText: string;
  statusColor: string;
}

/**
 * Analyze voltage value and return display status & color.
 */
export function analyzeVoltage(
  value: number,
  deviceState: DeviceState | null,
  isLoading: boolean,
): VoltageAnalysis {
  const isNominal = value >= 200 && value <= 240;
  const isFluctuating = value >= 190 && value <= 245;

  const statusText = isLoading
    ? "Syncing"
    : !deviceState
      ? "Offline"
      : !deviceState.state
        ? "Disabled"
        : isNominal
          ? "Nominal"
          : "Fluctuating";

  const statusColor = isLoading
    ? "bg-zinc-200"
    : !deviceState || !deviceState.state
      ? "bg-zinc-400"
      : isNominal
        ? "bg-emerald-500"
        : isFluctuating
          ? "bg-amber-500"
          : "bg-red-500 animate-pulse";

  return { isNominal, isFluctuating, statusText, statusColor };
}

// ─── Current Analysis ──────────────────────────────────────────────────────

export interface CurrentAnalysis {
  statusText: string;
  statusColor: string;
}

/**
 * Analyze current value and return display status & color.
 */
export function analyzeCurrent(
  value: number,
  deviceState: DeviceState | null,
  isLoading: boolean,
): CurrentAnalysis {
  const statusText = isLoading
    ? "Syncing"
    : !deviceState
      ? "Offline"
      : !deviceState.state
        ? "Disabled"
        : value <= 8
          ? "Safe Load"
          : "Overload Alert";

  const statusColor = isLoading
    ? "bg-zinc-200"
    : !deviceState || !deviceState.state
      ? "bg-zinc-400"
      : value <= 8
        ? "bg-emerald-500"
        : value <= 10
          ? "bg-amber-500 animate-pulse"
          : "bg-red-500 animate-pulse";

  return { statusText, statusColor };
}

// ─── Power Analysis ────────────────────────────────────────────────────────

export interface PowerAnalysis {
  statusText: string;
  statusColor: string;
}

/**
 * Analyze active power value and return display status & color.
 */
export function analyzePower(
  value: number,
  deviceState: DeviceState | null,
  isLoading: boolean,
): PowerAnalysis {
  const statusText = isLoading
    ? "Syncing"
    : !deviceState
      ? "Offline"
      : !deviceState.state
        ? "No Draw"
        : "Realtime W";

  const statusColor = isLoading
    ? "bg-zinc-200"
    : !deviceState || !deviceState.state
      ? "bg-zinc-400"
      : value <= 2000
        ? "bg-emerald-500"
        : "bg-orange-500 animate-pulse";

  return { statusText, statusColor };
}

// ─── Frequency Analysis ────────────────────────────────────────────────────

export interface FrequencyAnalysis {
  statusText: string;
  statusColor: string;
}

/**
 * Analyze grid frequency value and return display status & color.
 */
export function analyzeFrequency(
  value: number,
  deviceState: DeviceState | null,
  isLoading: boolean,
): FrequencyAnalysis {
  const isStable = value >= 49.5 && value <= 50.5;

  const statusText = isLoading
    ? "Syncing"
    : !deviceState
      ? "Offline"
      : isStable
        ? "Stable"
        : "Grid Stress";

  const statusColor = isLoading
    ? "bg-zinc-200"
    : !deviceState
      ? "bg-zinc-400"
      : isStable
        ? "bg-emerald-500"
        : "bg-rose-500 animate-pulse";

  return { statusText, statusColor };
}

// ─── Analysis Compilation ──────────────────────────────────────────────────

export interface DeviceAnalysis {
  voltageSpikes: number;
  currentSpikes: number;
  maxPower: number;
  maxPowerTime: string;
  peakHour: string;
  energyUsed: number;
  estimatedCost: number;
}

const UNIT_PRICE_BDT = 8.5; // BDT rate per kWh unit

/**
 * Compile insights and analysis from device history data.
 */
export function compileDeviceAnalysis(
  historyData: DeviceHistory[],
): DeviceAnalysis | null {
  if (historyData.length === 0) return null;

  let voltageSpikes = 0;
  let currentSpikes = 0;
  let maxPower = 0;
  let maxPowerTime = "";
  const peakHoursMap: Record<number, number> = {};

  historyData.forEach((h) => {
    if (h.voltage > 240 || h.voltage < 190) voltageSpikes++;
    if (h.current > 10) currentSpikes++;
    if (h.power > maxPower) {
      maxPower = h.power;
      maxPowerTime = new Date(h.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const hour = new Date(h.created_at).getHours();
    peakHoursMap[hour] = (peakHoursMap[hour] || 0) + h.power;
  });

  let peakHour = -1;
  let peakHourVal = -1;
  Object.keys(peakHoursMap).forEach((h) => {
    const key = Number(h);
    if (peakHoursMap[key] > peakHourVal) {
      peakHourVal = peakHoursMap[key];
      peakHour = key;
    }
  });

  // Energy consumption is cumulative
  const oldestEnergy = historyData[0].energy;
  const newestEnergy = historyData[historyData.length - 1].energy;
  const energyUsed = Math.max(0, newestEnergy - oldestEnergy);
  const estimatedCost = energyUsed * UNIT_PRICE_BDT;

  return {
    voltageSpikes,
    currentSpikes,
    maxPower,
    maxPowerTime,
    peakHour: peakHour !== -1 ? formatHour12(peakHour) : "N/A",
    energyUsed,
    estimatedCost,
  };
}

// ─── Internal Helpers ──────────────────────────────────────────────────────

function formatHour12(hour: number): string {
  const ampm = hour >= 12 ? "PM" : "AM";
  const formatted = hour % 12 || 12;
  return `${formatted} ${ampm}`;
}
