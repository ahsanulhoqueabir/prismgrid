import { getSupabaseServerClient } from "@/lib/api/supabase";
import { success, error } from "@/lib/api/api-response";
import { signJwt } from "@/lib/jwt.helper";
import { hashPassword, verifyPassword } from "@/lib/password.helper";
import type { JwtPayload, LoginParams } from "@/types/business/user.types";

export class AuthService {
  /**
   * Creates a new user directly in the `profiles` table.
   * Password is hashed with Argon2 before storing.
   * Returns the created profile id on success.
   */
  static async signUp(
    email: string,
    password: string,
    name: string,
    username?: string,
  ) {
    try {
      const supabase = getSupabaseServerClient();

      // Check if email already exists
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existing } = await (supabase as any)
        .from("profile")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        return error("A user with this email already exists");
      }

      // Hash the password with Argon2
      const hashed = await hashPassword(password);

      // Insert into profiles table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: sbError } = await (supabase as any)
        .from("profile")
        .insert({
          email,
          password: hashed,
          name,
          username: username ?? null,
          role: "user",
        })
        .select("id, email, name, username, role")
        .single();

      if (sbError) {
        return error(sbError.message);
      }

      if (!data) {
        return error("Failed to create profile");
      }

      return success({ profile: data });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }

  /**
   * Authenticate a user by email + password using the `profiles` table.
   * Verifies the Argon2 hash, then returns a JWT token and profile data.
   */
  static async login(params: LoginParams) {
    try {
      const supabase = getSupabaseServerClient();

      // Fetch profile by email (include password for verification)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile, error: sbError } = await (supabase as any)
        .from("profile")
        .select("*")
        .eq("email", params.email)
        .maybeSingle();

      if (sbError || !profile) {
        return error("Invalid email or password");
      }

      // Verify password with Argon2
      const valid = await verifyPassword(params.password, profile.password);

      if (!valid) {
        return error("Invalid email or password");
      }

      // Sign JWT token
      const jwtPayload: JwtPayload = {
        profile: profile.id,
        email: profile.email,
        role: profile.role,
      };

      const token = await signJwt(jwtPayload);

      return success({
        token,
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          username: profile.username,
          role: profile.role,
        },
      });
    } catch (err) {
      return error((err as Error).message || "An unknown error occurred");
    }
  }
}
