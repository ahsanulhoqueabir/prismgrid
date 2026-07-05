import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { DeviceService } from "@/services/device.service";

/**
 * POST /api/device/relay/acknowledge?id=COMMAND_ID
 *
 * Unprotected route — ESP32 calls this after executing a relay command
 * to confirm the command was carried out.
 *
 * Query params:
 *   id (required) — UUID of the relay command to acknowledge
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commandId = searchParams.get("id");

    if (!commandId) {
      return fail({ error: "Query parameter 'id' is required" });
    }

    const result = await DeviceService.acknowledgeRelayCommand(commandId);

    if (!result.success) {
      return fail({ error: result.error, statusCode: 500 });
    }

    return ok({
      data: result.data,
      message: "Relay command acknowledged",
    });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
