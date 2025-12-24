import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation constants
const MAX_MESSAGE_LENGTH = 5000;
const MAX_MESSAGES = 50;
const VALID_ROLES = ['user', 'assistant'];

interface ChatMessage {
  role: string;
  content: string;
}

function validateMessages(messages: unknown): { valid: boolean; error?: string; messages?: ChatMessage[] } {
  // Check if messages is an array
  if (!Array.isArray(messages)) {
    return { valid: false, error: 'Messages must be an array' };
  }

  // Check message count
  if (messages.length === 0) {
    return { valid: false, error: 'At least one message is required' };
  }

  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: `Maximum ${MAX_MESSAGES} messages allowed` };
  }

  // Validate each message
  const validatedMessages: ChatMessage[] = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    // Check message structure
    if (typeof msg !== 'object' || msg === null) {
      return { valid: false, error: `Message ${i + 1} is invalid` };
    }

    const { role, content } = msg as { role?: unknown; content?: unknown };

    // Validate role
    if (typeof role !== 'string' || !VALID_ROLES.includes(role)) {
      return { valid: false, error: `Message ${i + 1} has invalid role. Must be 'user' or 'assistant'` };
    }

    // Validate content
    if (typeof content !== 'string') {
      return { valid: false, error: `Message ${i + 1} content must be a string` };
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return { valid: false, error: `Message ${i + 1} content cannot be empty` };
    }

    if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, error: `Message ${i + 1} exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` };
    }

    validatedMessages.push({ role, content: trimmedContent });
  }

  return { valid: true, messages: validatedMessages };
}

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

    console.log("Authenticated user:", user.id);

    // Parse and validate request body
    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof requestBody !== 'object' || requestBody === null) {
      return new Response(
        JSON.stringify({ error: "Request body must be an object" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages } = requestBody as { messages?: unknown };

    // Validate messages
    const validation = validateMessages(messages);
    if (!validation.valid) {
      console.error("Validation error:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validatedMessages = validation.messages!;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing study chat request for user:", user.id, "with messages:", validatedMessages.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `You are StudyBuddy, an expert AI tutor designed to help students prepare for exams and understand academic concepts. Your goal is to provide clear, accurate, and helpful explanations.

Guidelines:
- Explain concepts in a clear, step-by-step manner
- Use examples and analogies to make complex topics easier to understand
- Be encouraging and supportive
- If a question is ambiguous, ask for clarification
- For math and science questions, show your work and explain each step
- For essay-type subjects, provide structured, well-organized responses
- Keep responses concise but thorough - typically 2-4 paragraphs
- Use bullet points and numbered lists when appropriate
- If you don't know something, be honest about it
- Always encourage further learning and curiosity

You can help with subjects including but not limited to:
- Mathematics (algebra, calculus, geometry, statistics)
- Science (physics, chemistry, biology, earth science)
- History and Social Studies
- English and Literature
- Foreign Languages
- Computer Science
- Economics
- Test prep (SAT, ACT, GRE, etc.)` 
          },
          ...validatedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway for user:", user.id);

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Study chat error:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
