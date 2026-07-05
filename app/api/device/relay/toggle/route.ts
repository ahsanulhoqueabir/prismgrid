import { withAuth } from "@/lib/api/auth-middleware";
import { DeviceService } from "@/services/device.service";
import { fail, ok } from "@/lib/api/api-response";

/**
 * POST /api/device/relay/toggle
 *
 * Protected route — creates a pending relay command for the authenticated user.
 * The profile ID is extracted from the JWT token.
 * ESP32 will pick up this command on its next state-update poll.
 *
 * Body:
 *   { "state": true }  → turn relay ON
 *   { "state": false } → turn relay OFF
 */
export const POST = withAuth(async ({ req, user }) => {
  try {
    const body = await req.json();
    const { state } = body;

    if (state === undefined || typeof state !== "boolean") {
      return fail({ error: "Required field: state (boolean)" });
    }

    const result = await DeviceService.setRelayCommand({
      profile: user.profile,
      state,
    });

    if (!result.success) {
      return fail({ error: result.error, statusCode: 500 });
    }

    return ok({
      data: result.data,
      message: state
        ? "Relay turn-on command sent to device"
        : "Relay turn-off command sent to device",
    });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
});
