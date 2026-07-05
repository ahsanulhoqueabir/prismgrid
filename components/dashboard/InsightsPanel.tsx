import React from "react";
import { IconTrendingUp, IconCoins, IconInfoCircle } from "@tabler/icons-react";
import type { InsightsPanelProps } from "@/types/business/component.types";

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ analysis }) => {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between h-full">
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-white">
            Range Summary
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Calculated statistics for the active logs.
          </p>
        </div>

        {analysis ? (
          <div className="space-y-4">
            {/* Energy Delta */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                  <IconTrendingUp size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                    Range Consumption
                  </p>
                  <p className="text-sm font-extrabold text-zinc-800 dark:text-white">
                    {analysis.energyUsed.toFixed(3)} kWh
                  </p>
                </div>
              </div>
            </div>

            {/* Cost Calculation */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <IconCoins size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                    Projected Cost (৳ 100/kWh)
                  </p>
                  <p className="text-sm font-extrabold text-zinc-800 dark:text-white">
                    ৳ {analysis.estimatedCost.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 space-y-1">
                <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">
                  Power Peak
                </span>
                <p className="text-sm font-extrabold text-zinc-800 dark:text-white">
                  {analysis.maxPower.toFixed(0)} W
                </p>
                <span className="text-[9px] text-zinc-400 font-medium block">
                  at {analysis.maxPowerTime}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 space-y-1">
                <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">
                  Peak Hour
                </span>
                <p className="text-sm font-extrabold text-zinc-800 dark:text-white">
                  {analysis.peakHour}
                </p>
                <span className="text-[9px] text-zinc-400 font-medium block">
                  Highest avg power
                </span>
              </div>
            </div>

            {/* Threshold Violations logs */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Grid Anomalies Registered
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-amber-200/50 bg-amber-50/10 text-amber-700 dark:border-amber-900/20 dark:bg-amber-950/10 dark:text-amber-400">
                  <span className="text-xs font-semibold">V-Spikes</span>
                  <span className="text-xs font-bold">
                    {analysis.voltageSpikes}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-rose-200/50 bg-rose-50/10 text-rose-700 dark:border-rose-900/20 dark:bg-rose-950/10 dark:text-rose-500">
                  <span className="text-xs font-semibold">Current Spikes</span>
                  <span className="text-xs font-bold">
                    {analysis.currentSpikes}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-400">
            <IconInfoCircle
              className="mx-auto mb-2 text-zinc-350 dark:text-zinc-650"
              size={24}
            />
            <p className="text-xs font-medium">
              Select timeframe to compile insights.
            </p>
          </div>
        )}
      </div>

      {/* Smart trend note card */}
      {analysis && (
        <div className="mt-5 p-4 rounded-lg bg-blue-50/30 border border-blue-200/30 text-blue-900 dark:bg-blue-950/10 dark:border-blue-900/20 dark:text-blue-300">
          <div className="flex gap-2">
            <IconInfoCircle
              className="shrink-0 text-blue-600 dark:text-blue-400"
              size={16}
            />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider leading-none">
                PrismGrid Insights Note
              </h4>
              <p className="text-xs mt-1.5 leading-relaxed font-medium">
                {analysis.voltageSpikes > 0
                  ? `Caution: Grid voltage crossed the safety margin ${analysis.voltageSpikes} times in this period. Appliance protectors are actively monitoring.`
                  : "Grid quality is exceptionally stable! No voltage spikes or sags were recorded."}
              </p>
              {analysis.peakHour !== "N/A" && (
                <p className="text-[10px] mt-1.5 opacity-80 leading-normal">
                  Shift heavy-load appliances to off-peak periods for cost
                  efficiency (peak: {analysis.peakHour}).
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
