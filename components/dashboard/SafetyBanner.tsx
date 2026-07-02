import React, { useState } from "react";
import { IconCheck, IconPower, IconAlertTriangle } from "@tabler/icons-react";
import type { SafetyBannerProps } from "@/types/business/component.types";
import { getDeviceSafetyStatus } from "@/lib/utils/device.utils";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const SafetyBanner: React.FC<SafetyBannerProps> = ({
  deviceState,
  isLoadingState,
  isTogglingState,
  handleToggleState,
}) => {
  const safety = getDeviceSafetyStatus(deviceState);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSwitchChange = (checked: boolean) => {
    if (checked) {
      // Show confirmation dialog when turning ON
      setShowConfirm(true);
    } else {
      // Instantly toggle when turning OFF
      handleToggleState();
    }
  };

  const handleConfirmAction = () => {
    setShowConfirm(false);
    handleToggleState();
  };

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all duration-300 ${
          safety.status === "safe"
            ? "border-emerald-200/60 bg-emerald-50/20 text-emerald-950 dark:border-emerald-900/30 dark:bg-emerald-950/10 dark:text-emerald-300"
            : safety.status === "warning"
              ? "border-amber-200/60 bg-amber-50/20 text-amber-950 dark:border-amber-900/30 dark:bg-amber-950/10 dark:text-amber-300"
              : safety.status === "cutoff"
                ? "border-zinc-300 bg-zinc-150/50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400"
                : "border-rose-200/60 bg-rose-50/20 text-rose-950 dark:border-rose-900/30 dark:bg-rose-950/10 dark:text-rose-300"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          {/* Detail telemetry view (desktop only) */}
          <div className="hidden sm:flex items-start gap-3.5">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm ${
                safety.status === "safe"
                  ? "bg-emerald-600 text-white"
                  : safety.status === "warning"
                    ? "bg-amber-500 text-white"
                    : safety.status === "cutoff"
                      ? "bg-zinc-500 text-white"
                      : "bg-rose-600 text-white"
              }`}
            >
              {safety.status === "safe" ? (
                <IconCheck size={20} />
              ) : safety.status === "cutoff" ? (
                <IconPower size={20} />
              ) : (
                <IconAlertTriangle size={20} />
              )}
            </div>
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">
                SYSTEM GRID SECURITY NODE
              </h2>
              <p className="mt-1 text-sm font-semibold tracking-tight">
                {safety.message}
              </p>
            </div>
          </div>

          {/* Relay Control Action - adaptive for mobile */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start bg-transparent sm:bg-white/40 dark:bg-transparent dark:sm:bg-zinc-900/40 backdrop-blur-none sm:backdrop-blur-sm border-0 sm:border border-transparent sm:border-zinc-200/50 dark:sm:border-zinc-800/50 rounded-none sm:rounded-lg p-0 sm:p-2.5 transition-all duration-300">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 leading-none">
                Relay Output
              </span>
              <span
                className={`text-[10px] font-bold mt-1 uppercase ${
                  deviceState?.state
                    ? "text-emerald-500"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                {deviceState?.state ? "Relay Closed (ON)" : "Relay Open (OFF)"}
              </span>
            </div>
            <Switch
              checked={deviceState?.state || false}
              onCheckedChange={handleSwitchChange}
              disabled={isLoadingState || !deviceState || isTogglingState}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Alert Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <IconAlertTriangle className="text-amber-500" size={20} />
              Confirm Relay Activation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close the output relay and activate the
              system grid?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isTogglingState}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmAction();
              }}
              disabled={isTogglingState}
              className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              {isTogglingState ? "Activating..." : "Confirm Activation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
