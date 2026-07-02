import { createClient } from "@supabase/supabase-js";
import { sb } from "@/config/env.config";

/**
 * Client-side Supabase client singleton for real-time Postgres subscriptions.
 * Uses public environment variables for anon access.
 */
export const supabaseClient = createClient(
  sb.url || "",
  sb.annon || "",
  {
    auth: {
      persistSession: false,
    },
  }
);
