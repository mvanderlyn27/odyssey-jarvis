import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";

export async function authenticateRequest(req: Request) {
  const internalSecret = req.headers.get("X-Internal-Secret");
  const internalSecretKey = Deno.env.get("INTERNAL_SECRET_KEY");

  console.log("Authenticating request...");
  console.log("X-Internal-Secret header:", internalSecret ? "present" : "missing");
  console.log("INTERNAL_SECRET_KEY from env:", internalSecretKey ? "loaded" : "not loaded");

  // 1. Check for the internal secret (for server-to-server calls)
  if (internalSecret) {
    if (internalSecretKey && internalSecret === internalSecretKey) {
      console.log("Authenticated with internal secret.");
      return { user: null, error: null };
    } else {
      console.error("Internal secret mismatch or not set in environment.");
      return {
        user: null,
        error: new Error("Invalid internal secret."),
      };
    }
  }

  // 2. Check for a valid JWT (for client-side calls)
  const authHeader = req.headers.get("Authorization");
  if (authHeader) {
    console.log("Attempting JWT authentication.");
    try {
      const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
        global: { headers: { Authorization: authHeader } },
      });
      const { data, error } = await supabaseClient.auth.getUser();
      if (error) throw error;
      console.log("JWT authentication successful.");
      return { user: data.user, error: null };
    } catch (error) {
      console.error("JWT authentication failed:", error);
      return { user: null, error };
    }
  }

  // 3. If neither is present or valid, deny access
  console.log("No valid authentication method found. Denying access.");
  return {
    user: null,
    error: new Error("Authentication required."),
  };
}
