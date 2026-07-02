import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/api-response";
import { AuthService } from "@/services/auth.service";
import { signJwt } from "@/lib/jwt.helper";
import type { JwtPayload } from "@/types/business/user.types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, username } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return fail({ error: "Email, password, and name are required" });
    }

    // Create user directly in profiles table (password hashed with Argon2)
    const authResult = await AuthService.signUp(
      email,
      password,
      name,
      username,
    );

    if (!authResult.success) {
      return fail({ error: authResult.error });
    }

    const { data } = authResult;
    const jwtPayload: JwtPayload = {
      profile: data.profile.id,
      email: data.profile.email,
      role: data.profile.role,
    };

    const token = await signJwt(jwtPayload);

    return ok({
      data: {
        user: data.profile,
        token,
      },
      message: "User created successfully",
      statusCode: 201,
    });
  } catch (err) {
    return fail({
      error: (err as Error).message || "An unknown error occurred",
      statusCode: 500,
    });
  }
}
