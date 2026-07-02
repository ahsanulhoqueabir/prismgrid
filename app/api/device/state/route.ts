import { withAuth } from "@/lib/api/auth-middleware";
import { DeviceService } from "@/services/device.service";
import { fail, ok } from "@/lib/api/api-response";

/**
 * GET /api/device/state
 *
 * Protected route — fetches the current device state for the authenticated user.
 * The profile ID is extracted from the JWT token.
 */
export const GET = withAuth(async ({ user }) => {
  const result = await DeviceService.getStateByProfile(user.profile);

  if (!result.success) {
    return fail({ error: result.error, statusCode: 404 });
  }

  return ok({ data: result.data });
});
