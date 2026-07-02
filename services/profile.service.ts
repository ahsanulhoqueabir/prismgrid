import { getSupabaseServerClient } from "@/lib/api/supabase";
import { success, error } from "@/lib/api/api-response";
import type { ProfileData } from "@/types/db/profile.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string };

export class ProfileService {
  private static collection = "profile";

  /**
   * Fetch a single profile by its primary key.
   * Returns public profile data (no password/api_key).
   */
  static async getById(id: string): Promise<ServiceResult<ProfileData>> {
    try {
      const supabase = getSupabaseServerClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from(this.collection)
        .select(
          "id, email, name, username, role, phone, created_at, updated_at",
        )
        .eq("id", id)
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Profile not found");
      }

      return success(data as ProfileData);
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
