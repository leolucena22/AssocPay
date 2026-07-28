import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
  );
}

/**
 * Supabase admin client authenticated with the service role key.
 *
 * IMPORTANT: This client bypasses Row Level Security and must NEVER be exposed
 * to the browser or returned in any response. Use it only in server-side code
 * (API routes, server actions, etc.).
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // Disable automatic session management — this is a server-only client.
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

/** Convenience accessor for the Storage API. */
export const storage = supabaseAdmin.storage;
