import { getSupabaseServerClient } from "@/lib/api/supabase";
import { success, error } from "@/lib/api/api-response";
import type {
  DeviceState,
  DeviceHistory,
  UpdateDeviceStatePayload,
  InsertDeviceHistoryPayload,
  HistoryQueryParams,
} from "@/types/db/device.types";
import type {
  RelayCommand,
  CreateRelayCommandPayload,
} from "@/types/db/relay.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

export class DeviceService {
  /**
   * Fetch the current device state for a given profile.
   * Used by the protected route — client sends JWT, we extract profile from it.
   */
  static async getStateByProfile(
    profileId: string,
  ): Promise<ServiceResult<DeviceState>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from("device_states")
        .select("*")
        .eq("profile", profileId)
        .maybeSingle();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Device state not found for this profile");
      }

      return success(data as DeviceState);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Fetch device history for a profile with optional time-range filtering.
   * Supports: last_hour, last_week, or custom date range.
   */
  static async getHistory(
    params: HistoryQueryParams,
  ): Promise<ServiceResult<DeviceHistory[]>> {
    try {
      const supabase = getSupabaseServerClient();

      // Build the query
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from("device_history")
        .select("*")
        .eq("profile", params.profile)
        .order("created_at", { ascending: false });

      // Apply time-range filter
      const now = new Date();
      if (params.range === "last_hour") {
        const oneHourAgo = new Date(
          now.getTime() - 60 * 60 * 1000,
        ).toISOString();
        query = query.gte("created_at", oneHourAgo);
      } else if (params.range === "last_week") {
        const oneWeekAgo = new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString();
        query = query.gte("created_at", oneWeekAgo);
      } else if (params.range === "custom") {
        if (params.from) {
          query = query.gte("created_at", params.from);
        }
        if (params.to) {
          query = query.lte("created_at", params.to);
        }
      }

      const { data, error: sbError } = await query;

      if (sbError) {
        return error(sbError.message);
      }

      return success((data as DeviceHistory[]) || []);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Update (upsert) the device state for a given profile.
   * This is an unprotected endpoint — the profile is sent in the payload.
   * Uses upsert because device_states has a UNIQUE constraint on profile.
   */
  static async updateState(
    payload: UpdateDeviceStatePayload,
  ): Promise<ServiceResult<DeviceState>> {
    try {
      const supabase = getSupabaseServerClient();

      // Upsert: if a row for this profile exists, update it; otherwise insert
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from("device_states")
        .upsert(
          {
            profile: payload.profile,
            voltage: payload.voltage,
            current: payload.current,
            power: payload.power,
            frequency: payload.frequency,
            energy: payload.energy,
            state: payload.state,
          },
          { onConflict: "profile", ignoreDuplicates: false },
        )
        .select("*")
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success(data as DeviceState);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Insert a new record into device_history.
   * This is an unprotected endpoint — the profile is sent in the payload.
   */
  static async insertHistory(
    payload: InsertDeviceHistoryPayload,
  ): Promise<ServiceResult<DeviceHistory>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from("device_history")
        .insert({
          profile: payload.profile,
          voltage: payload.voltage,
          current: payload.current,
          power: payload.power,
          frequency: payload.frequency,
          energy: payload.energy,
          state: payload.state,
        })
        .select("*")
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success(data as DeviceHistory);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Create a relay command (toggle ON/OFF).
   * Upserts so that only one pending command exists per profile at a time.
   * If there's already a pending command with the same state, it's a no-op.
   * Used by the protected web UI endpoint.
   */
  static async setRelayCommand(
    payload: CreateRelayCommandPayload,
  ): Promise<ServiceResult<RelayCommand>> {
    try {
      const supabase = getSupabaseServerClient();

      // First, check if there's already a pending command with the same state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existing } = await (supabase as any)
        .from("relay_commands")
        .select("*")
        .eq("profile", payload.profile)
        .eq("status", "pending")
        .maybeSingle();

      if (existing && existing.state === payload.state) {
        // Same command already pending — return it as-is
        return success(existing as RelayCommand);
      }

      // Delete any existing pending command for this profile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("relay_commands")
        .delete()
        .eq("profile", payload.profile)
        .eq("status", "pending");

      // Insert the new relay command
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from("relay_commands")
        .insert({
          profile: payload.profile,
          state: payload.state,
          status: "pending",
        })
        .select("*")
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      return success(data as RelayCommand);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Poll for a pending relay command for a given profile.
   * If a pending command exists, it is atomically marked as "executed"
   * and returned so the caller (ESP32) can act on it.
   * Used by the unprotected ESP32 polling endpoint.
   */
  static async pollRelayCommand(
    profile: string,
  ): Promise<ServiceResult<RelayCommand | null>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from("relay_commands")
        .select("*")
        .eq("profile", profile)
        .eq("status", "pending")
        .maybeSingle();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        // No pending command
        return success(null);
      }

      // Atomically mark as executed
      const now = new Date().toISOString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated, error: updateError } = await (supabase as any)
        .from("relay_commands")
        .update({ status: "executed", executed_at: now })
        .eq("id", data.id)
        .eq("status", "pending") // optimistic lock
        .select("*")
        .single();

      if (updateError) {
        return error(updateError.message);
      }

      return success(updated as RelayCommand);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
