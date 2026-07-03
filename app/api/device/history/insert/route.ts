import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { DeviceService } from "@/services/device.service";

/**
 * POST /api/device/history/insert
 *
 * Unprotected route — inserts a new record into device_history.
 * The profile ID is sent in the request body (not from JWT).
 * This allows IoT devices / embedded systems to push data without authentication.
 *
 * Power & Energy are calculated on the route layer:
 *   power (W)  = voltage × current
 *   energy (kWh) = power × (1/3600)  — per-second energy contribution
 * Frequency defaults to 50 Hz if not provided.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, voltage, current, frequency, state } = body;

    // Validate required fields
    if (!profile) {
      return fail({ error: "Profile ID is required" });
    }

    if (voltage === undefined || current === undefined || state === undefined) {
      return fail({
        error: "Required fields: voltage, current, state",
      });
    }

    // ── Route-layer calculations ──────────────────────────────
    const v = Number(voltage);
    const i = Number(current);
    const p = v * i; // power (Watts)
    const e = p * (1 / 3600); // energy (kWh per second)
    const f = frequency !== undefined ? Number(frequency) : 50; // fallback 50 Hz

    const result = await DeviceService.insertHistory({
      profile,
      voltage: v,
      current: i,
      power: p,
      frequency: f,
      energy: e,
      state: Boolean(state),
    });

    if (!result.success) {
      return fail({ error: result.error, statusCode: 500 });
    }

    return ok({
      data: result.data,
      message: "Device history record inserted successfully",
      statusCode: 201,
    });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
