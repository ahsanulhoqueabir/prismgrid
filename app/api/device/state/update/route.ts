import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { DeviceService } from "@/services/device.service";

/**
 * POST /api/device/state/update
 *
 * Unprotected route — upserts the device state for a given profile.
 * The profile ID is sent in the request body (not from JWT).
 * This allows IoT devices / embedded systems to push data without authentication.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, voltage, current, power, frequency, energy, state } = body;

    // Validate required fields
    if (!profile) {
      return fail({ error: "Profile ID is required" });
    }

    if (
      voltage === undefined ||
      current === undefined ||
      power === undefined ||
      frequency === undefined ||
      energy === undefined ||
      state === undefined
    ) {
      return fail({
        error:
          "All device metrics (voltage, current, power, frequency, energy, state) are required",
      });
    }

    const result = await DeviceService.updateState({
      profile,
      voltage: Number(voltage),
      current: Number(current),
      power: Number(power),
      frequency: Number(frequency),
      energy: Number(energy),
      state: Boolean(state),
    });

    if (!result.success) {
      return fail({ error: result.error, statusCode: 500 });
    }

    return ok({
      data: result.data,
      message: "Device state updated successfully",
    });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
