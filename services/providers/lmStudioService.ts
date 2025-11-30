// LM Studio provider service (local OpenAI-compatible API)
// Uses OpenAI-compatible chat completions endpoint
import type { VideoPrompt } from '../../types';

const LM_STUDIO_BASE_URL_KEY = 'LM_STUDIO_BASE_URL';
const LM_STUDIO_MODEL_KEY = 'LM_STUDIO_MODEL';
const DEFAULT_BASE_URL = 'http://localhost:1234';
// Users must configure their actual model name in Settings (e.g., 'qwen/qwen2.5-vl-7b@q4_k_m')
const DEFAULT_MODEL = '';

function getBaseUrl(): string {
  try {
    return (typeof window !== 'undefined' && window.localStorage.getItem(LM_STUDIO_BASE_URL_KEY)) || DEFAULT_BASE_URL;
  } catch {
    return DEFAULT_BASE_URL;
  }
}

function getModel(): string {
  try {
    return (typeof window !== 'undefined' && window.localStorage.getItem(LM_STUDIO_MODEL_KEY)) || DEFAULT_MODEL;
  } catch {
    return DEFAULT_MODEL;
  }
}

function extractJson<T = any>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    // Step 1: Remove markdown code blocks and extra text
    let cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Step 2: Find JSON boundaries first
    const jsonStart = Math.min(
      ...['[', '{']
        .map((c) => cleanText.indexOf(c))
        .filter((i) => i >= 0)
    );
    const jsonEnd = Math.max(
      ...[']', '}']
        .map((c) => cleanText.lastIndexOf(c))
        .filter((i) => i >= 0)
    );
    
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      cleanText = cleanText.slice(jsonStart, jsonEnd + 1);
    }
    
    // Step 3: Fix common formatting issues
    cleanText = cleanText
      .replace(/,\s*}/g, '}')                     // Remove trailing commas in objects
      .replace(/,\s*]/g, ']')                     // Remove trailing commas in arrays
      .replace(/}\s*{/g, '},{')                   // Fix missing commas between objects
      .replace(/]\s*\[/g, '],[')                  // Fix missing commas between arrays
      .replace(/"\s*"([^,}\]])/g, '","$1')        // Fix missing commas after strings
      .replace(/([0-9])\s*"([^,}\]])/g, '$1,"$2') // Fix missing commas after numbers
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":')     // Quote unquoted keys
      .replace(/:\s*'([^']*)'/g, ':"$1"');        // Replace single quotes with double
    
    try {
      return JSON.parse(cleanText) as T;
    } catch (e) {
      // Show more helpful error with context
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      throw new Error(`Failed to parse JSON: ${errorMsg}\nFirst 300 chars: ${text.substring(0, 300)}...`);
    }
  }
}

async function chat({
  messages,
  temperature = 0.7,
  max_tokens = 1024,
}: {
  messages: any[];
  temperature?: number;
  max_tokens?: number;
}): Promise<string> {
  const baseUrl = getBaseUrl();
  const model = getModel();

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
      stream: false,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    const errorMsg = errText.includes('model_not_found') || errText.includes('Invalid model identifier')
      ? `LM Studio error: Model "${model}" not found. Please check Settings and use your actual model name from LM Studio (e.g., 'qwen/qwen2.5-vl-7b@q4_k_m').`
      : `LM Studio error: ${res.status} ${errText}`;
    throw new Error(errorMsg);
  }

  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? '';
  if (!content) throw new Error('Empty response from LM Studio.');
  return content.trim();
}

export async function generateCaptionFromImage(params: { imageData: string; mimeType: string; isNsfw: boolean }): Promise<string[]> {
  const { imageData, mimeType, isNsfw } = params;
  const dataUrl = `data:${mimeType};base64,${imageData}`;

  const sfwSystemPrompt = `Analyze the image and return exactly 3 rich, detailed caption options (each 80-120 words). When a person is the main subject/protagonist, lead with detailed physicality, then describe feelings and environment:

**Lead with Physicality:**
- Race/Ethnicity (Slavic, Asian, African, etc.)
- Hair color/style
- Body type and size (petite, athletic, curvy, muscular)
- Breast size (when relevant: small, medium, large)
- Notable features (freckles, dimples, scars, tattoos)

**Then add Action & Sensory Details:**
- What they're doing (action/pose)
- Sensory details (how things feel - cool metal, warm skin, rough fabric)

**Describe Feelings & Environment:**
- Emotional atmosphere (tension, serenity, passion, excitement)
- Environmental mood and lighting quality
- Setting details that enhance emotional tone

**Examples:**
SFW: "A broad-shouldered African American man with tight curly black hair and defined abs is mid-pullup in a dimly lit industrial gym. His biceps bulge and veins stand out against his dark skin. The atmosphere is gritty and determined, with golden hour light cutting through dusty windows, creating dramatic shadows. The air feels heavy with effort and ambition."
NSFW: "A petite Asian woman with long black hair, large breasts, and slender legs stands in semi-transparent lingerie. Her skin is porcelain pale with a small birthmark below her collarbone. The bedroom atmosphere is thick with anticipation, silk sheets catching warm lamplight behind her. Her gaze is both vulnerable and inviting, the space intimate and hushed."

Return exactly 3 captions as a JSON array of strings. Output JSON only.`;

  const nsfwSystemPrompt = `Analyze this image and produce exactly 3 EXTREMELY DETAILED, EXPLICIT caption options (each 100-150 words). This is NSFW adult content - BE EXPLICIT and ANATOMICALLY PRECISE:

**LEAD WITH EXPLICIT PHYSICALITY (MANDATORY):**
- Race/Ethnicity with skin tone details (pale ivory, golden tan, deep ebony)
- Hair: color, length, style, texture
- Body type: exact build (slim, toned, athletic, curvy, voluptuous, petite)
- Breasts: EXACT size and shape (small perky, medium full, large heavy) - describe nipple visibility, areola size
- Height and body proportions (long legs, short torso)
- Intimate details: body hair, pubic region if visible, piercings, tattoos
- Genitalia: when visible, describe explicitly (penis size/state, vulva appearance)
- State of undress: describe exactly what's exposed and covered

**EXPLICIT ACTION & POSITIONS:**
- Sexual position or pose with anatomical precision
- Body parts in contact (where hands/mouths/genitals are)
- Explicit sexual acts being performed
- Physical reactions (arousal indicators, body responses)
- Sensory details (skin texture, wetness, temperature, friction)

**SEXUAL ATMOSPHERE & CONTEXT:**
- Emotional state (lust, desire, passion, submission, dominance)
- Lighting on naked/exposed skin
- Sexual tension and energy in the scene

BE EXTREMELY EXPLICIT. Use anatomically correct terms. Describe sexual content with precision.

Return exactly 3 captions as a JSON array of strings. Output JSON only.`;

  const messages = [
    {
      role: 'system',
      content: isNsfw ? nsfwSystemPrompt : sfwSystemPrompt
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Analyze this image following the system instructions for detailed physical descriptions when people are present.' },
        { type: 'image_url', image_url: { url: dataUrl } }
      ]
    }
  ];

  const text = await chat({ messages, temperature: 0.7 });
  const json = extractJson<string[]>(text);
  if (!Array.isArray(json)) throw new Error('LM Studio did not return an array.');
  return json as string[];
}

export async function transformPromptToJson(promptText: string): Promise<object> {
  const messages = [
    {
      role: 'system',
      content: 'Return a strict JSON object matching the requested fields. Output JSON only.'
    },
    {
      role: 'user',
      content: `Analyze this video prompt and return a JSON object with these keys: scene_description, visual_style, protagonist_action, camera_angle, camera_movement, lighting_details, additional_keywords (array).\n\nPrompt: "${promptText}"`
    }
  ];

  const text = await chat({ messages, temperature: 0.1 });
  return extractJson<object>(text);
}

// ============ THREE-PART GENERATION SYSTEM ============

// Part 1: Caption & Character Generation
export async function generateCaptionAndCharacter(params: {
  scene: string;
  style: string;
  isNsfw: boolean;
}): Promise<string> {
  const { scene, style, isNsfw } = params;

  const messages = [
    {
      role: 'system',
      content: isNsfw
        ? 'You are an expert Z-Image-Turbo prompt writer specializing in adult content. Z-Turbo excels with LONG, DETAILED prompts. Use explicit, anatomically precise terminology. Describe bodies, features, and settings with maximum detail and clarity.'
        : 'You are an expert Z-Image-Turbo prompt writer. Z-Turbo works best with LONG, DETAILED, STRUCTURED prompts. Focus on precise subject and scene descriptions with rich visual detail.'
    },
    {
      role: 'user',
      content: `Create a detailed subject and scene description (80-120 words) following Z-Image-Turbo image generation principles.

Scene: "${scene}"
Visual Style: "${style}"

Z-Image-Turbo requires STRUCTURED, DETAILED prompts. Structure your description:
1. **Subject Description**: Describe the main subject in detail (who/what, appearance, features, clothing/elements)
2. **Scene Setting**: Describe the environment and atmosphere (where, mood, lighting quality)

Follow Z-Turbo guidelines:
- Be LONG and DETAILED (Z-Turbo excels with verbose prompts)
- Use natural, flowing language
- Include specific visual details
- Mention artistic style/aesthetic
- Don't use keyword lists
- Token target: 150-200 tokens

Example: "A young woman with flowing auburn hair wearing an elegant red evening gown, standing in a rain-soaked neon-lit Tokyo street at night, cyberpunk aesthetic with dramatic rim lighting"

Return ONLY the description as plain text (no JSON, no labels).`
    }
  ];

  return await chat({ messages, temperature: 0.8, max_tokens: 300 });
}

// Part 2: Action & Scene Dynamics
export async function generateActionDescription(params: {
  refinedScene: string;
  protagonistAction: string;
  isNsfw: boolean;
}): Promise<string> {
  const { refinedScene, protagonistAction, isNsfw } = params;

  const messages = [
    {
      role: 'system',
      content: isNsfw
        ? 'You are an expert Z-Image-Turbo prompt writer for adult content. Z-Turbo loves LONG, DETAILED descriptions. Describe poses, positions, and physical details with explicit clarity and rich atmospheric detail. Use anatomically correct terms.'
        : 'You are an expert Z-Image-Turbo prompt writer. Z-Turbo works best with LONG, DETAILED descriptions. Focus on composition, pose, and rich atmospheric details.'
    },
    {
      role: 'user',
      content: `Add detailed composition and pose details to this scene (60-100 words) following Z-Image-Turbo principles.

Scene Foundation: "${refinedScene}"
Subject Action/Pose: "${protagonistAction}"

Z-Image-Turbo requires LONG, DETAILED descriptions. Structure your addition:
- **Subject Pose/Action**: Describe the subject's exact pose, body position, hand placement, what they're doing
- **Visual Composition**: How the scene is framed, layered, and composed
- Keep it LONG, descriptive, and visually specific

Follow Z-Turbo guidelines:
- Be VERBOSE and DETAILED (Z-Turbo loves long prompts)
- Use natural, flowing descriptive language
- Be specific about positioning and composition
- Avoid keyword lists
- Token target: 100-150 tokens

Example: "leaning against a weathered brick wall with arms crossed, body angled toward the camera, creating a dynamic diagonal composition with strong leading lines"

Return ONLY the composition description as plain text (no JSON, no labels).`
    }
  ];

  return await chat({ messages, temperature: 0.8, max_tokens: 250 });
}

// Part 3: Final Z-Image-Turbo Prompts
export async function generateFinalPrompts(params: {
  actionDescription: string;
  cameraAngle: string;
  lighting: string;
  colorPalette: string;
  mood: string;
  compositionType: string;
  isNsfw: boolean;
  cameraDevice?: string;
}): Promise<VideoPrompt[]> {
  const { actionDescription, cameraAngle, lighting, colorPalette, mood, compositionType, isNsfw, cameraDevice } = params;

  const messages = [
    {
      role: 'system',
      content: isNsfw
        ? 'You are an expert Z-Image-Turbo prompt writer for adult content. Z-Turbo excels with EXTREMELY LONG, DETAILED prompts (200-300 words). Create explicit image prompts with maximum anatomical detail. Output JSON only.'
        : 'You are an expert Z-Image-Turbo prompt writer. Z-Turbo works best with LONG, DETAILED prompts (150-250 words). Create verbose, descriptive prompts. Output JSON only.'
    },
    {
      role: 'user',
      content: `Generate 3 EXTREMELY DETAILED Z-Image-Turbo prompt variations as a JSON array (${isNsfw ? '200-300' : '150-250'} words each). Each item has {"title": string, "prompt": string}.

Subject & Scene: "${actionDescription}"
Perspective: "${cameraAngle}"
Lighting: "${lighting}"
Color Palette: "${colorPalette}"
Mood/Atmosphere: "${mood}"
Composition: "${compositionType}"
Photography Style: "${cameraDevice ?? 'professional photography'}"

Z-Image-Turbo Guidelines:
- EXTREMELY LONG AND DETAILED (${isNsfw ? '200-300' : '150-250'} words per prompt)
- Z-Turbo LOVES verbose, structured, flowing descriptions
- Include detailed subject physicality, positioning, environment, lighting, colors, mood, composition
- ${isNsfw ? 'Use explicit, anatomically precise terminology with maximum detail' : 'Focus on rich artistic and technical details'}
- Use natural flowing paragraphs, not keyword lists
- Token target: ${isNsfw ? '400-500' : '300-400'} tokens (Z-Turbo supports up to 1024)
- Include bilingual text elements when relevant

Example: "A cyberpunk hacker in neon-lit room, vibrant electric colors, dramatic rim lighting, rule of thirds composition, shot on ARRI Alexa with anamorphic lens, moody and mysterious atmosphere"

Integrate all elements naturally into cohesive, EXTREMELY DETAILED prompts.

Return ONLY a JSON array of 3 prompts.`
    }
  ];

  const content = await chat({ messages, temperature: 0.85, max_tokens: 2500 });
  const json = extractJson<VideoPrompt[]>(content);
  if (!Array.isArray(json)) throw new Error('Expected an array of prompts.');
  return json as VideoPrompt[];
}

// ============ LEGACY SINGLE-CALL GENERATION ============

export async function generatePrompts(params: {
  scene: string;
  style: string;
  protagonistAction: string;
  cameraAngle: string;
  cameraMovement: string;
  lighting: string;
  isNsfw: boolean;
  cameraDevice?: string;
}): Promise<VideoPrompt[]> {
  const { scene, style, protagonistAction, cameraAngle, cameraMovement, lighting, isNsfw, cameraDevice } = params;

  const systemContent = isNsfw
    ? 'You are a master visual storyteller for adult, tasteful content. Follow safety rules. Generate video prompts as JSON only.'
    : 'You are a master visual storyteller for cinematic content. Generate video prompts as JSON only.';

  const userContent = `Generate 3 video prompt variations as a JSON array. Each item has {"title": string, "prompt": string}.

Rules:
- 80–120 words each (max 140).
- **CRITICAL: Build each prompt around the Main Scene description - it's your foundation. Use every detail from it.**
- Weave camera angle and movement into narrative.
- Combine elements cohesively.

Criteria:
- Main Scene (YOUR FOUNDATION): "${scene}"
- Visual Style: "${style}"
- Protagonist Action: "${protagonistAction}"
- Camera Angle: "${cameraAngle}"
- Camera Movement: "${cameraMovement}"
- Camera/Device: "${cameraDevice ?? ''}"
- Lighting: "${lighting}"`;

  const messages = [
    { role: 'system', content: systemContent },
    { role: 'user', content: userContent }
  ];

  const text = await chat({
    messages,
    temperature: isNsfw ? 0.9 : 0.8,
    max_tokens: 1500
  });

  const json = extractJson<VideoPrompt[]>(text);
  if (!Array.isArray(json)) throw new Error('Expected an array of prompts.');
  return json as VideoPrompt[];
}