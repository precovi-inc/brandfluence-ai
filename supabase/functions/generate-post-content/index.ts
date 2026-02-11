import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateRequest {
  title: string;
  direction: string;
  platforms: string[];
  imageUrls: string[];
  brandId?: string;
}

interface PlatformContent {
  platform: string;
  content: string;
  hashtags: string[];
  characterCount: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { title, direction, platforms, imageUrls, brandId }: GenerateRequest = await req.json();

    if (!title || !direction || !platforms?.length) {
      throw new Error("Title, direction, and at least one platform are required");
    }

    // Fetch brand guidelines if brandId is provided
    let brandContext = "";
    if (brandId) {
      const { data: brand } = await supabaseClient
        .from("brands")
        .select("name, voice_characteristics, content_themes, brand_essence")
        .eq("id", brandId)
        .single();

      if (brand) {
        brandContext = `
Brand Name: ${brand.name}
Voice Characteristics: ${brand.voice_characteristics?.join(", ") || "Not specified"}
Content Themes: ${brand.content_themes?.join(", ") || "Not specified"}
Brand Essence: ${JSON.stringify(brand.brand_essence) || "Not specified"}
`;
      }

      // Also fetch parsed brand guidelines
      const { data: guidelines } = await supabaseClient
        .from("brand_guidelines")
        .select("parsed_content")
        .eq("brand_id", brandId)
        .not("parsed_content", "is", null);

      if (guidelines?.length) {
        brandContext += "\n\nBrand Guidelines:\n" + guidelines.map(g => g.parsed_content).join("\n\n");
      }
    }

    // Platform-specific constraints
    const platformSpecs: Record<string, { maxLength: number; style: string }> = {
      instagram: {
        maxLength: 2200,
        style: "Visual storytelling, engaging, uses emojis, conversational. Focus on lifestyle and visual appeal."
      },
      twitter: {
        maxLength: 280,
        style: "Concise, punchy, uses relevant hashtags sparingly. Direct and impactful."
      },
      linkedin: {
        maxLength: 3000,
        style: "Professional, thought leadership, value-driven. Use line breaks for readability."
      },
      facebook: {
        maxLength: 500,
        style: "Conversational, community-focused, shareable. Balance between casual and informative."
      }
    };

    const selectedPlatforms = platforms.map(p => ({
      name: p,
      spec: platformSpecs[p] || { maxLength: 500, style: "General social media post" }
    }));

    const hasImages = imageUrls && imageUrls.length > 0;
    const imageContext = hasImages 
      ? `The post includes ${imageUrls.length} image(s). Reference or complement the visual content.`
      : "This is a text-only post without images.";

    const systemPrompt = `You are an expert social media content creator. Generate engaging, on-brand content for different social media platforms.

${brandContext ? `BRAND CONTEXT:\n${brandContext}` : "No specific brand context provided - use a professional, friendly tone."}

CONTENT REQUIREMENTS:
- Create unique, tailored content for each platform
- Maintain consistent messaging while adapting to each platform's style
- Include relevant hashtags (3-5 for Instagram, 1-2 for Twitter, 3-5 for LinkedIn, 2-3 for Facebook)
- ${imageContext}
- Make content engaging and shareable
- Stay within character limits for each platform`;

    const userPrompt = `Create social media posts for the following:

POST TITLE: ${title}

CREATIVE DIRECTION: ${direction}

PLATFORMS TO CREATE FOR:
${selectedPlatforms.map(p => `- ${p.name}: Max ${p.spec.maxLength} characters. Style: ${p.spec.style}`).join("\n")}

Generate a JSON response with exactly this structure:
{
  "variations": [
    {
      "platform": "platform_name",
      "content": "the post content",
      "hashtags": ["hashtag1", "hashtag2"]
    }
  ]
}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_social_posts",
              description: "Generate social media post variations for different platforms",
              parameters: {
                type: "object",
                properties: {
                  variations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        platform: { type: "string", description: "Social media platform name" },
                        content: { type: "string", description: "The post content" },
                        hashtags: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "Relevant hashtags without the # symbol"
                        }
                      },
                      required: ["platform", "content", "hashtags"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["variations"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_social_posts" } }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    
    // Extract the tool call response
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No content generated");
    }

    const generatedContent = JSON.parse(toolCall.function.arguments);

    // Add character counts to each variation
    const variations: PlatformContent[] = generatedContent.variations.map((v: any) => ({
      platform: v.platform,
      content: v.content,
      hashtags: v.hashtags,
      characterCount: v.content.length
    }));

    return new Response(
      JSON.stringify({ variations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
