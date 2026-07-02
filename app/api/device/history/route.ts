import { withAuth } from "@/lib/api/auth-middleware";
import { DeviceService } from "@/services/device.service";
import { fail, ok } from "@/lib/api/api-response";

/**
 * GET /api/device/history?range=last_hour
 * GET /api/device/history?range=last_week
 * GET /api/device/history?range=custom&from=2024-01-01T00:00:00Z&to=2024-01-31T23:59:59Z
 *
 * Protected route — fetches device history for the authenticated user.
 * The profile ID is extracted from the JWT token.
 * Supports time-range filtering via query parameters.
 */
export const GET = withAuth(async ({ req, user }) => {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") as
    | "last_hour"
    | "last_week"
    | "custom"
    | null;
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;

  const result = await DeviceService.getHistory({
    profile: user.profile,
    range: range || undefined,
    from,
    to,
  });

  if (!result.success) {
    return fail({ error: result.error, statusCode: 500 });
  }

  return ok({ data: result.data });
});
