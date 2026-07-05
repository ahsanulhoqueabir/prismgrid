import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { DeviceService } from "@/services/device.service";

/**
 * GET /api/device/relay/pending?profile=PROFILE_UUID
 *
 * Unprotected route — ESP32 polls this endpoint after each state update
 * to check if there's a pending relay command.
 *
 * If a pending command exists, it is atomically marked as "executed"
 * and returned in the response. The ESP32 then acts on it.
 *
 * Query params:
 *   profile (required) — Supabase profiles table UUID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profile = searchParams.get("profile");

    if (!profile) {
      return fail({ error: "Query parameter 'profile' is required" });
    }

    const result = await DeviceService.pollRelayCommand(profile);

    if (!result.success) {
      return fail({ error: result.error, statusCode: 500 });
    }

    return ok({
      data: result.data, // null if no pending command
    });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
