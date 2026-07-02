// ─── Date / Time Formatting ────────────────────────────────────────────────

export type ChartRange = "last_hour" | "last_week" | "custom";

/**
 * Format an ISO date string for chart display.
 * For "last_hour" range: shows HH:MM:SS
 * For other ranges: shows "Mon DD, HH:MM"
 */
export function formatChartDate(isoStr: string, range: ChartRange): string {
  const d = new Date(isoStr);
  if (range === "last_hour") {
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a Date or ISO string to a short time string (HH:MM).
 */
export function formatShortTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Convert a datetime-local input value to an ISO string.
 */
export function toIsoString(datetimeLocal: string): string {
  return new Date(datetimeLocal).toISOString();
}

// ─── Number Formatting ─────────────────────────────────────────────────────

/**
 * Format a number with a fixed number of decimal places based on unit type.
 */
export function formatMetricValue(
  value: number,
  unit: string,
  isLoading: boolean,
): string {
  if (isLoading) return "—";
  if (unit === "A") return value.toFixed(2);
  if (unit === "kWh") return value.toFixed(3);
  return value.toFixed(1);
}

/**
 * Format a number as currency (BDT).
 */
export function formatBdt(amount: number): string {
  return `৳ ${amount.toFixed(2)}`;
}

// ─── Chart Data Mapping ────────────────────────────────────────────────────

export interface ChartDataPoint {
  time: string;
  voltage: number;
  current: number;
  power: number;
  energy: number;
  frequency: number;
}

/**
 * Map DeviceHistory array to chart-compatible data points.
 */
export function toChartData(
  historyData: {
    created_at: string;
    voltage: number;
    current: number;
    power: number;
    energy: number;
    frequency: number;
  }[],
  range: ChartRange,
): ChartDataPoint[] {
  return historyData.map((h) => ({
    time: formatChartDate(h.created_at, range),
    voltage: Number(h.voltage.toFixed(1)),
    current: Number(h.current.toFixed(2)),
    power: Number(h.power.toFixed(1)),
    energy: Number(h.energy.toFixed(3)),
    frequency: Number(h.frequency.toFixed(1)),
  }));
}
