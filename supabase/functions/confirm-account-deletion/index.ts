import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      console.error("Missing token in request");
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing deletion confirmation for token:", token);

    // Create admin client for privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Find the deletion request
    const { data: deletionRequest, error: findError } = await supabaseAdmin
      .from('account_deletion_requests')
      .select('*')
      .eq('token', token)
      .is('confirmed_at', null)
      .single();

    if (findError || !deletionRequest) {
      console.error("Deletion request not found:", findError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid or expired confirmation link" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token is expired
    if (new Date(deletionRequest.expires_at) < new Date()) {
      console.error("Token expired at:", deletionRequest.expires_at);
      return new Response(
        JSON.stringify({ error: "This confirmation link has expired. Please request a new one." }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = deletionRequest.user_id;
    console.log("Starting account deletion for user:", userId);

    // Mark the request as confirmed
    await supabaseAdmin
      .from('account_deletion_requests')
      .update({ confirmed_at: new Date().toISOString() })
      .eq('id', deletionRequest.id);

    // Delete user's chat messages first (due to foreign key constraints)
    const { error: messagesError } = await supabaseAdmin
      .from('chat_messages')
      .delete()
      .eq('user_id', userId);

    if (messagesError) {
      console.error("Error deleting chat messages:", messagesError);
      throw new Error("Failed to delete chat messages");
    }
    console.log("Deleted chat messages for user:", userId);

    // Delete user's chat sessions
    const { error: sessionsError } = await supabaseAdmin
      .from('chat_sessions')
      .delete()
      .eq('user_id', userId);

    if (sessionsError) {
      console.error("Error deleting chat sessions:", sessionsError);
      throw new Error("Failed to delete chat sessions");
    }
    console.log("Deleted chat sessions for user:", userId);

    // Delete user's profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (profileError) {
      console.error("Error deleting profile:", profileError);
      throw new Error("Failed to delete profile");
    }
    console.log("Deleted profile for user:", userId);

    // Delete all deletion requests for this user
    const { error: requestsError } = await supabaseAdmin
      .from('account_deletion_requests')
      .delete()
      .eq('user_id', userId);

    if (requestsError) {
      console.error("Error deleting deletion requests:", requestsError);
      // Non-critical, continue with account deletion
    }

    // Delete the auth user
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error("Error deleting auth user:", deleteUserError);
      throw new Error("Failed to delete user account");
    }
    console.log("Successfully deleted user account:", userId);

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Account deletion error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to delete account" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
