import type { ReactNode } from "react";
import { AuthUser } from "./user.types";
import { DeviceState } from "../db/device.types";

// ─── GaugeCard Props ───────────────────────────────────────────────────────

export interface GaugeCardProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  icon: ReactNode;
  isLoading: boolean;
  statusText: string;
  statusColor: string;
  gradientId: string;
  gradientColors: { start: string; end: string };
}

// ─── AnalyticsCharts Props ─────────────────────────────────────────────────

export type ChartRange = "last_hour" | "last_week" | "custom";

// ─── InsightsPanel Props ───────────────────────────────────────────────────

export interface InsightsPanelProps {
  analysis: {
    voltageSpikes: number;
    currentSpikes: number;
    maxPower: number;
    maxPowerTime: string;
    peakHour: string;
    energyUsed: number;
    estimatedCost: number;
  } | null;
}

// ─── SafetyBanner Props ────────────────────────────────────────────────────

export interface SafetyBannerProps {
  deviceState: DeviceState | null;
  isLoadingState: boolean;
  isTogglingState: boolean;
  handleToggleState: () => void;
}

// ─── Navbar Props ──────────────────────────────────────────────────────────

export interface NavbarProps {
  user: AuthUser | null;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  logout: () => void;
}
