"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore, selectIsAuthenticated } from "@/store/auth.store";
import { brand } from "@/config/brand.config";
import { api_client } from "@/lib/api/api-client";
import { supabaseClient } from "@/lib/supabase-client";
import type { DeviceState, DeviceHistory } from "@/types/db/device.types";
import type { ChartRange } from "@/types/business/component.types";
import {
  analyzeVoltage,
  analyzeCurrent,
  analyzePower,
  analyzeFrequency,
  compileDeviceAnalysis,
} from "@/lib/utils/device.utils";
import {
  initDarkMode,
  toggleDarkMode as toggleTheme,
} from "@/lib/utils/theme.utils";
import { toChartData } from "@/lib/utils/format.utils";
import { formatMetricValue } from "@/lib/utils/format.utils";
import {
  IconBolt,
  IconActivity,
  IconFlame,
  IconPlug,
  IconTrendingUp,
} from "@tabler/icons-react";

import { Navbar } from "@/components/dashboard/Navbar";
import { SafetyBanner } from "@/components/dashboard/SafetyBanner";
import { GaugeCard } from "@/components/dashboard/GaugeCard";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import { Footer } from "@/components/dashboard/Footer";

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // States
  const [deviceState, setDeviceState] = useState<DeviceState | null>(null);
  const [historyData, setHistoryData] = useState<DeviceHistory[]>([]);
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [range, setRange] = useState<ChartRange>("last_hour");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTogglingState, setIsTogglingState] = useState(false);
  const [activeTab, setActiveTab] = useState<"power" | "voltage">("power");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dark Mode Sync
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDarkMode(initDarkMode());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => toggleTheme(prev));
  };

  // Check auth
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Fetch initial real-time state from DB
  const fetchCurrentState = useCallback(async () => {
    if (!user?.id) return;
    setIsLoadingState(true);
    try {
      const response = await api_client.get("/device/state");
      if (response.data?.success && response.data?.data) {
        setDeviceState(response.data.data);
        setErrorMsg(null);
      } else {
        setDeviceState(null);
      }
    } catch (err: unknown) {
      console.error("Error fetching state:", err);
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status !== 404) {
          setErrorMsg("Failed to fetch current device state.");
        }
      } else {
        setErrorMsg("Failed to fetch current device state.");
      }
    } finally {
      setIsLoadingState(false);
    }
  }, [user?.id]);

  // Fetch history data
  const fetchHistory = useCallback(async () => {
    if (!user?.id) return;
    setIsLoadingHistory(true);
    try {
      const params: {
        range: ChartRange;
        from?: string;
        to?: string;
      } = { range };

      if (range === "custom") {
        if (!customFrom || !customTo) return;
        params.from = new Date(customFrom).toISOString();
        params.to = new Date(customTo).toISOString();
      }
      const response = await api_client.get("/device/history", { params });
      if (response.data?.success && response.data?.data) {
        // Reverse history to show older to newer in chronological charts
        const sortedData = [...response.data.data].reverse();
        setHistoryData(sortedData);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user?.id, range, customFrom, customTo]);

  // Supabase Real-time Subscription
  useEffect(() => {
    if (!user?.id) return;

    const timer = setTimeout(() => {
      fetchCurrentState();
    }, 0);

    const channel = supabaseClient
      .channel(`device-state-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "device_states",
          filter: `profile=eq.${user.id}`,
        },
        (payload) => {
          console.log("Realtime state update received:", payload);
          if (payload.new) {
            setDeviceState(payload.new as DeviceState);
          }
        },
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabaseClient.removeChannel(channel);
    };
  }, [user?.id, fetchCurrentState]);

  // Fetch history on range or custom dates change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchHistory]);

  // Toggle relay state
  const handleToggleState = async () => {
    if (!user?.id || !deviceState || isTogglingState) return;
    setIsTogglingState(true);
    try {
      const nextState = !deviceState.state;
      const response = await api_client.post("/device/state/update", {
        profile: user.id,
        state: nextState,
        voltage: deviceState.voltage,
        current: deviceState.current,
        power: deviceState.power,
        frequency: deviceState.frequency,
        energy: deviceState.energy,
      });

      if (response.data?.success) {
        setDeviceState(response.data.data);
      }
    } catch (err) {
      console.error("Error toggling device state:", err);
    } finally {
      setIsTogglingState(false);
    }
  };

  // Compile insights using shared utility
  const analysis = compileDeviceAnalysis(historyData);

  // Hide page contents while checking authentication
  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/logo.png"
            alt={brand.name}
            width={48}
            height={48}
            priority
            className="opacity-50 dark:invert"
          />
          <div className="h-1 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-650" />
          </div>
        </div>
      </div>
    );
  }

  // Chart data using shared utility
  const chartData = toChartData(historyData, range);

  // Individual metric analysis using shared utilities
  const vVal = isLoadingState ? 0 : deviceState ? deviceState.voltage : 0;
  const voltageAnalysis = analyzeVoltage(vVal, deviceState, isLoadingState);

  const cVal = isLoadingState ? 0 : deviceState ? deviceState.current : 0;
  const currentAnalysis = analyzeCurrent(cVal, deviceState, isLoadingState);

  const pVal = isLoadingState ? 0 : deviceState ? deviceState.power : 0;
  const powerAnalysis = analyzePower(pVal, deviceState, isLoadingState);

  const fVal = isLoadingState ? 0 : deviceState ? deviceState.frequency : 0;
  const freqAnalysis = analyzeFrequency(fVal, deviceState, isLoadingState);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 font-sans transition-colors duration-200">
      {/* Navbar Component */}
      <Navbar
        user={user}
        isDarkMode={isDarkMode}
        toggleDarkMode={handleToggleDarkMode}
        logout={logout}
      />

      {/* Main Container */}
      <main className="flex-1 px-4 py-8 md:px-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Error message alert, if any */}
        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-650 dark:border-red-950/20 dark:bg-red-950/20 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Safety Banner Component */}
        <SafetyBanner
          deviceState={deviceState}
          isLoadingState={isLoadingState}
          isTogglingState={isTogglingState}
          handleToggleState={handleToggleState}
        />

        {/* Real-time Telemetry Widgets - Circular Gauges & Energy Card */}
        <section className="grid gap-5 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {/* Voltage Gauge */}
          <GaugeCard
            value={vVal}
            min={150}
            max={300}
            unit="V"
            label="Voltage"
            icon={<IconBolt className="text-blue-500" size={18} />}
            isLoading={isLoadingState}
            statusText={voltageAnalysis.statusText}
            statusColor={voltageAnalysis.statusColor}
            gradientId="voltageGradient"
            gradientColors={{ start: "#3b82f6", end: "#06b6d4" }}
          />

          {/* Current Gauge */}
          <GaugeCard
            value={cVal}
            min={0}
            max={15}
            unit="A"
            label="Current"
            icon={<IconActivity className="text-emerald-500" size={18} />}
            isLoading={isLoadingState}
            statusText={currentAnalysis.statusText}
            statusColor={currentAnalysis.statusColor}
            gradientId="currentGradient"
            gradientColors={{ start: "#10b981", end: "#14b8a6" }}
          />

          {/* Active Power Gauge */}
          <GaugeCard
            value={pVal}
            min={0}
            max={3000}
            unit="W"
            label="Active Power"
            icon={<IconFlame className="text-amber-500" size={18} />}
            isLoading={isLoadingState}
            statusText={powerAnalysis.statusText}
            statusColor={powerAnalysis.statusColor}
            gradientId="powerGradient"
            gradientColors={{ start: "#f59e0b", end: "#ef4444" }}
          />

          {/* Grid Frequency Gauge */}
          <GaugeCard
            value={fVal}
            min={45}
            max={55}
            unit="Hz"
            label="Grid Freq"
            icon={<IconPlug className="text-indigo-500" size={18} />}
            isLoading={isLoadingState}
            statusText={freqAnalysis.statusText}
            statusColor={freqAnalysis.statusColor}
            gradientId="freqGradient"
            gradientColors={{ start: "#6366f1", end: "#8b5cf6" }}
          />

          {/* Energy Usage Widget (Cumulative Stat with Circular Progress Flow) */}
          <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:shadow-md duration-300 flex flex-col items-center col-span-1 sm:col-span-2 lg:col-span-1 justify-between">
            <div className="flex w-full items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Energy Usage
              </span>
              <IconTrendingUp className="text-violet-500" size={18} />
            </div>

            {/* Circular Energy Flow indicator */}
            <div className="relative w-full max-w-37.5 aspect-4/3 flex items-center justify-center mt-1">
              <svg viewBox="0 0 100 100" className="w-20 h-20">
                <defs>
                  <linearGradient
                    id="energyGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-zinc-100 dark:text-zinc-800"
                />
                {/* Flowing Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="url(#energyGrad)"
                  strokeWidth="6"
                  strokeDasharray="239"
                  strokeDashoffset="60"
                  strokeLinecap="round"
                  className="animate-spin"
                  style={{
                    transformOrigin: "50px 50px",
                    animationDuration: "8s",
                  }}
                />
                {/* Core inner dot */}
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  className="fill-zinc-50 dark:fill-zinc-850"
                />
              </svg>

              {/* Absolute values inside the ring */}
              <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
                <span className="text-lg font-extrabold text-zinc-850 dark:text-white leading-none">
                  {formatMetricValue(
                    deviceState?.energy ?? 0,
                    "kWh",
                    isLoadingState,
                  )}
                </span>
                <span className="text-[9px] font-semibold text-zinc-400 mt-1">
                  kWh
                </span>
              </div>
            </div>

            <div className="mt-3.5 flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-850 px-2.5 py-1 rounded-full border border-zinc-150/40 dark:border-zinc-800/40 w-full justify-center">
              <span
                className={`h-2 w-2 rounded-full ${
                  isLoadingState
                    ? "bg-zinc-200"
                    : !deviceState
                      ? "bg-zinc-400"
                      : "bg-violet-500 animate-pulse"
                }`}
              />
              <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {isLoadingState
                  ? "Syncing"
                  : !deviceState
                    ? "Offline"
                    : "Cumulative Log"}
              </span>
            </div>
          </div>
        </section>

        {/* Analytics & Graphs */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* History Chart Component */}
          <AnalyticsCharts
            historyData={historyData}
            chartData={chartData}
            isLoadingHistory={isLoadingHistory}
            range={range}
            setRange={setRange}
            customFrom={customFrom}
            setCustomFrom={setCustomFrom}
            customTo={customTo}
            setCustomTo={setCustomTo}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isDarkMode={isDarkMode}
          />

          {/* Dynamic Insights & Summaries Component */}
          <InsightsPanel analysis={analysis} />
        </div>
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}
