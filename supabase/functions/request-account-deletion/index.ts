import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's auth token to get user info
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid or expired authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Creating deletion request for user:", user.id, "email:", user.email);

    // Create admin client for privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check for existing pending requests (not expired and not confirmed)
    const { data: existingRequests } = await supabaseAdmin
      .from('account_deletion_requests')
      .select('id, created_at')
      .eq('user_id', user.id)
      .is('confirmed_at', null)
      .gt('expires_at', new Date().toISOString())
      .limit(1);

    if (existingRequests && existingRequests.length > 0) {
      console.log("Existing pending request found, will create new one");
    }

    // Create a new deletion request
    const { data: deletionRequest, error: insertError } = await supabaseAdmin
      .from('account_deletion_requests')
      .insert({
        user_id: user.id,
        email: user.email!,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating deletion request:", insertError);
      throw new Error("Failed to create deletion request");
    }

    console.log("Created deletion request:", deletionRequest.id, "token:", deletionRequest.token);

    // Build confirmation URL
    const appUrl = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || 'https://intelliprep.com';
    const confirmationUrl = `${appUrl}/confirm-deletion?token=${deletionRequest.token}`;

    // Send confirmation email
    const emailResponse = await resend.emails.send({
      from: "IntelliPrep <onboarding@resend.dev>",
      to: [user.email!],
      subject: "Confirm Account Deletion - IntelliPrep",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Account Deletion Request</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="margin-top: 0;">Hello,</p>
            
            <p>We received a request to permanently delete your IntelliPrep account associated with this email address.</p>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #dc2626; margin: 0; font-weight: 600;">⚠️ Warning: This action is irreversible!</p>
              <p style="color: #7f1d1d; margin: 10px 0 0 0; font-size: 14px;">All your data including chat history, sessions, and profile will be permanently deleted.</p>
            </div>
            
            <p>If you want to proceed with account deletion, click the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" style="background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Confirm Account Deletion</a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">This link will expire in <strong>1 hour</strong>.</p>
            
            <p style="font-size: 14px; color: #6b7280;">If you did not request this deletion, you can safely ignore this email. Your account will remain active.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #9ca3af; margin-bottom: 0; text-align: center;">
              © ${new Date().getFullYear()} IntelliPrep. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Confirmation email sent. Please check your inbox." 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Request account deletion error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to request account deletion" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
