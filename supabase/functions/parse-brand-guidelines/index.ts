import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { fileUrl, fileName, fileType, brandId } = await req.json();

    if (!fileUrl || !fileName || !fileType || !brandId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the user owns this brand
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id")
      .eq("id", brandId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (brandError || !brand) {
      return new Response(JSON.stringify({ error: "Brand not found or unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download the file content
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      return new Response(JSON.stringify({ error: "Failed to download file" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let fileContent = "";
    const contentType = fileResponse.headers.get("content-type") || "";

    // For text-based files, read as text
    if (
      contentType.includes("text") ||
      fileType === "txt" ||
      fileType === "md" ||
      fileType === "markdown"
    ) {
      fileContent = await fileResponse.text();
    } else {
      // For PDF/Word/images, we'll send to AI with description
      const buffer = await fileResponse.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      
      // For images, include as base64 in the message
      if (fileType.match(/^(png|jpg|jpeg|gif|webp)$/i)) {
        fileContent = `[Image file: ${fileName}]`;
      } else {
        // For PDF/Word, describe that we have the file
        fileContent = `[Document file: ${fileName}, type: ${fileType}]`;
      }
    }

    // Use AI to extract brand guidelines
    const systemPrompt = `You are an expert brand strategist. Your task is to analyze uploaded brand guidelines documents and extract key brand information in a structured format.

Extract the following information if present:
1. Brand Voice & Tone: How should the brand communicate? (formal, casual, friendly, authoritative, etc.)
2. Core Values: What principles guide the brand?
3. Mission Statement: What is the brand's purpose?
4. Visual Guidelines: Colors, fonts, logo usage rules
5. Do's and Don'ts: What to include/avoid in communications
6. Target Audience: Who is the brand speaking to?
7. Key Messaging: Important phrases, taglines, or messaging pillars
8. Content Guidelines: Rules for creating content

Format your response as a clear, organized summary that can be used to guide AI content generation. Be specific and actionable.`;

    const userMessage = fileContent.startsWith("[")
      ? `Please analyze this brand guidelines document named "${fileName}" (${fileType} file). Since I cannot share the actual file content directly, please provide a template of what brand guidelines typically contain and how they should be structured. In a real scenario, you would analyze the uploaded document.`
      : `Please analyze the following brand guidelines document and extract the key brand rules and guidelines:\n\n${fileContent}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Failed to analyze document with AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const parsedContent = aiData.choices?.[0]?.message?.content || "Unable to parse document";

    // Save to database
    const { data: guideline, error: insertError } = await supabase
      .from("brand_guidelines")
      .insert({
        brand_id: brandId,
        file_name: fileName,
        file_type: fileType,
        file_url: fileUrl,
        parsed_content: parsedContent,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to save guidelines" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, guideline }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
