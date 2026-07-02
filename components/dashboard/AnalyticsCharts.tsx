import React, { useEffect, useState } from "react";
import { IconRefresh, IconInfoCircle } from "@tabler/icons-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

import type { DeviceHistory, ChartDataPoint } from "@/types/db/device.types";
import type { ChartRange } from "@/types/business/component.types";

interface AnalyticsChartsProps {
  historyData: DeviceHistory[];
  chartData: ChartDataPoint[];
  isLoadingHistory: boolean;
  range: ChartRange;
  setRange: (range: ChartRange) => void;
  customFrom: string;
  setCustomFrom: (val: string) => void;
  customTo: string;
  setCustomTo: (val: string) => void;
  activeTab: "power" | "voltage";
  setActiveTab: (tab: "power" | "voltage") => void;
  isDarkMode: boolean;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  historyData,
  chartData,
  isLoadingHistory,
  range,
  setRange,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
  activeTab,
  setActiveTab,
  isDarkMode,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const rangeOptions: { value: ChartRange; label: string }[] = [
    { value: "last_hour", label: "Hour" },
    { value: "last_week", label: "Week" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-white">
            Grid Analytics Logs
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Visual history of voltage, current, and active power logs.
          </p>
        </div>

        {/* Time Range Filter Buttons */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-lg dark:bg-zinc-800 max-w-max">
          {rangeOptions.map((t) => (
            <button
              key={t.value}
              onClick={() => setRange(t.value)}
              className={`rounded-md px-3 py-1 text-xs font-bold tracking-wide transition cursor-pointer ${
                range === t.value
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Range Inputs */}
      {range === "custom" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
              From
            </label>
            <input
              type="datetime-local"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-800 focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
              To
            </label>
            <input
              type="datetime-local"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-800 focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Metric Tab Selector */}
      <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800/50 pb-2">
        <button
          onClick={() => setActiveTab("power")}
          className={`pb-1 text-xs font-bold transition border-b-2 px-1 cursor-pointer ${
            activeTab === "power"
              ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          Power Draw (Watts)
        </button>
        <button
          onClick={() => setActiveTab("voltage")}
          className={`pb-1 text-xs font-bold transition border-b-2 px-1 cursor-pointer ${
            activeTab === "voltage"
              ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          Voltage & Current Quality
        </button>
      </div>

      {/* Dynamic Chart */}
      <div className="h-72 w-full relative">
        {isLoadingHistory ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <IconRefresh className="animate-spin text-zinc-400" size={24} />
              <span className="text-xs text-zinc-400 font-medium">
                Recompiling metrics...
              </span>
            </div>
          </div>
        ) : historyData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="p-5">
              <IconInfoCircle
                className="mx-auto text-zinc-300 dark:text-zinc-650 mb-2"
                size={32}
              />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-400">
                Empty history dataset
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-sm">
                We couldn&apos;t retrieve telemetry logs for this timeframe.
                Ensure your IoT nodes are connected and publishing.
              </p>
            </div>
          </div>
        ) : isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === "power" ? (
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e4e4e7"
                  className="stroke-zinc-200 dark:stroke-zinc-800"
                />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="#a1a1aa" />
                <YAxis tick={{ fontSize: 9 }} stroke="#a1a1aa" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                    borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                    color: isDarkMode ? "#ffffff" : "#000000",
                    fontSize: "11px",
                    borderRadius: "8px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", marginTop: "5px" }} />
                <Area
                  type="monotone"
                  dataKey="power"
                  name="Active Power (W)"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorPower)"
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e4e4e7"
                  className="stroke-zinc-200 dark:stroke-zinc-800"
                />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="#a1a1aa" />
                <YAxis yAxisId="left" tick={{ fontSize: 9 }} stroke="#3b82f6" />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 9 }}
                  stroke="#10b981"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                    borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                    color: isDarkMode ? "#ffffff" : "#000000",
                    fontSize: "11px",
                    borderRadius: "8px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", marginTop: "5px" }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="voltage"
                  name="Voltage (V)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="current"
                  name="Current (A)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
};
