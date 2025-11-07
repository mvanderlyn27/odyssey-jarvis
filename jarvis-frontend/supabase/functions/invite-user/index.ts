import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

console.log("invite-user function booting up");

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { organization_id, invitee_email, role } = await req.json();

    // 1. Get the inviting user from the Authorization header
    const authHeader = req.headers.get("Authorization")!;
    const jwt = authHeader.replace("Bearer ", "");
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(jwt);

    if (!user) {
      throw new Error("User not found");
    }

    // 2. Verify the inviting user is an owner of the organization
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .eq("organization_id", organization_id)
      .single();

    if (profileError || profile?.role !== "owner") {
      return new Response(JSON.stringify({ error: "Not authorized to invite users to this organization." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Check if the user already exists
    const { data: existingUser, error: existingUserError } = await supabaseAdmin.auth.admin.getUserByEmail(
      invitee_email
    );

    if (existingUserError && existingUserError.message !== "User not found") {
      throw existingUserError;
    }

    if (existingUser?.user) {
      // User exists, add them to the organization directly
      const { error: updateProfileError } = await supabaseAdmin
        .from("profiles")
        .update({ organization_id, role })
        .eq("id", existingUser.user.id);

      if (updateProfileError) {
        throw updateProfileError;
      }
      // Create an accepted invite record
      const { error: insertError } = await supabaseAdmin.from("organization_invites").insert({
        organization_id,
        invited_by_user_id: user.id,
        email: invitee_email,
        role,
        status: "accepted",
      });
      if (insertError) {
        throw insertError;
      }
      return new Response(JSON.stringify({ success: true, user: existingUser.user }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // User does not exist, invite them
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(invitee_email, {
        data: {
          organization_id: organization_id,
          role: role,
        },
      });

      if (inviteError) {
        throw inviteError;
      }

      // 4. Create a record in our public invites table
      const { error: insertError } = await supabaseAdmin.from("organization_invites").insert({
        organization_id,
        invited_by_user_id: user.id,
        email: invitee_email,
        role,
        status: "pending",
      });

      if (insertError) {
        // Note: In a production scenario, you might want to handle the case
        // where the auth invite was sent but the table insert failed.
        throw insertError;
      }
      return new Response(JSON.stringify({ success: true, user: inviteData.user }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error inviting user:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
