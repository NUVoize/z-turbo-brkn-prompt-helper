// Ollama provider service (local)
// Uses the /api/generate endpoint. For vision, pass base64 images (without data URL prefix).
import type { VideoPrompt } from '../../types';

const OLLAMA_BASE_URL_KEY = 'OLLAMA_BASE_URL';
const OLLAMA_MODEL_KEY = 'OLLAMA_MODEL';
const DEFAULT_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'qwen2.5-vl:32b';

function getBaseUrl(): string {
  try {
    return (typeof window !== 'undefined' && window.localStorage.getItem(OLLAMA_BASE_URL_KEY)) || DEFAULT_BASE_URL;
  } catch {
    return DEFAULT_BASE_URL;
  }
}

function getModel(): string {
  try {
    return (typeof window !== 'undefined' && window.localStorage.getItem(OLLAMA_MODEL_KEY)) || DEFAULT_MODEL;
  } catch {
    return DEFAULT_MODEL;
  }
}

function extractJson<T = any>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    // Step 1: Remove markdown code blocks
    let cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Step 2: Fix common escape sequence issues
    cleanText = cleanText
      .replace(/\\"/g, '"')  // Fix double-escaped quotes
      .replace(/\n/g, ' ')    // Replace newlines with spaces
      .replace(/\r/g, ' ')    // Replace carriage returns
      .replace(/\t/g, ' ')    // Replace tabs
      .replace(/\\/g, '\\\\') // Ensure backslashes are properly escaped
      .replace(/\\\\"/g, '\\"'); // But keep escaped quotes as single escape
    
    try {
      return JSON.parse(cleanText) as T;
    } catch {
      // Step 3: Find JSON boundaries
      const start = Math.min(
        ...['[', '{']
          .map((c) => cleanText.indexOf(c))
          .filter((i) => i >= 0)
      );
      const end = Math.max(
        ...[']', '}']
          .map((c) => cleanText.lastIndexOf(c))
          .filter((i) => i >= 0)
      );
      
      if (start >= 0 && end > start) {
        const slice = cleanText.slice(start, end + 1);
        try {
          return JSON.parse(slice) as T;
        } catch {
          // Step 4: Last resort - fix common JSON issues
          const fixedSlice = slice
            .replace(/,\s*}/g, '}')                    // Remove trailing commas in objects
            .replace(/,\s*]/g, ']')                    // Remove trailing commas in arrays
            .replace(/([{,]\s*)(\w+):/g, '$1"$2":')    // Quote unquoted keys
            .replace(/:\s*'([^']*)'/g, ':"$1"');       // Replace single quotes with double
          return JSON.parse(fixedSlice) as T;
        }
      }
      throw new Error(`Response was not valid JSON. Raw response: ${text.substring(0, 200)}...`);
    }
  }
}

async function generate({ prompt, images }: { prompt: string; images?: string[] }): Promise<string> {
  const baseUrl = getBaseUrl();
  const model = getModel();

  const res = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, images, stream: false }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Ollama error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const text: string = data?.response ?? '';
  if (!text) throw new Error('Empty response from Ollama.');
  return text.trim();
}

export async function generateCaptionFromImage(params: { imageData: string; mimeType: string; isNsfw: boolean }): Promise<string[]> {
  const { imageData, isNsfw } = params;
  
  const sfwPrompt = `Analyze the image and return exactly 3 detailed caption options (each 80-120 words). When a person is the main subject, lead with physicality, then describe feelings and environment:

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
SFW: "A broad-shouldered African American man with tight curly black hair and defined abs is mid-pullup in a dimly lit industrial gym. His biceps bulge and veins stand out against his dark skin. The atmosphere is gritty and determined, with golden hour light cutting through dusty windows. The air feels heavy with effort and ambition."
NSFW: "A petite Asian woman with long black hair, large breasts, and slender legs stands in semi-transparent lingerie. Her skin is porcelain pale with a small birthmark below her collarbone. The bedroom atmosphere is thick with anticipation, silk sheets catching warm lamplight. Her gaze is vulnerable and inviting, the space intimate and hushed."

Return exactly 3 captions as a JSON array of strings. Output JSON only.`;

  const nsfwPrompt = `Analyze this image and produce exactly 3 EXTREMELY DETAILED, EXPLICIT caption options (each 100-150 words). This is NSFW adult content - BE EXPLICIT and ANATOMICALLY PRECISE:

**LEAD WITH EXPLICIT PHYSICALITY:**
- Race/Ethnicity with skin tone (pale ivory, golden tan, deep ebony)
- Hair: color, length, style
- Body type: exact build (slim, toned, curvy, voluptuous, petite)
- Breasts: EXACT size and shape (small perky, medium full, large heavy) - nipple visibility, areola details
- Intimate details: body hair, pubic region visibility, piercings, tattoos
- Genitalia: when visible, describe explicitly (penis size/state, vulva appearance)
- State of undress: exactly what's exposed

**EXPLICIT ACTION & POSITIONS:**
- Sexual position/pose with anatomical precision
- Body parts in contact (hands/mouths/genitals placement)
- Explicit sexual acts being performed
- Physical reactions (arousal indicators)
- Sensory details (skin texture, wetness, temperature)

**SEXUAL ATMOSPHERE:**
- Emotional state (lust, desire, passion, submission, dominance)
- Lighting on naked/exposed skin
- Sexual tension and energy

BE EXTREMELY EXPLICIT. Use anatomically correct terms.

Return exactly 3 captions as a JSON array of strings. Output JSON only.`;

  const prompt = isNsfw ? nsfwPrompt : sfwPrompt;
  const text = await generate({ prompt, images: [imageData] });
  const json = extractJson<string[]>(text);
  if (!Array.isArray(json)) throw new Error('Ollama did not return an array.');
  return json as string[];
}

export async function transformPromptToJson(promptText: string): Promise<object> {
  const prompt = `Analyze the following video prompt and return a JSON object with keys: scene_description, visual_style, protagonist_action, camera_angle, camera_movement, lighting_details, additional_keywords (array). Output JSON only.\n\nPrompt: "${promptText}"`;
  const text = await generate({ prompt });
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

  const systemPrefix = isNsfw
    ? 'You are an expert Flux image prompt writer specializing in adult content. Use explicit, anatomically precise terminology. Describe bodies, features, and settings with maximum detail and clarity.'
    : 'You are an expert Flux image prompt writer. Focus on precise subject and scene descriptions following Flux best practices.';

  const prompt = `${systemPrefix}

Create a detailed subject and scene description (60-80 words) following Flux image generation principles.

Scene: "${scene}"
Visual Style: "${style}"

Structure your description:
1. **Subject Description**: Describe the main subject in detail (who/what, appearance, features, clothing/elements)
2. **Scene Setting**: Describe the environment and atmosphere (where, mood, lighting quality)

Follow Flux guidelines:
- Be specific and descriptive
- Use natural, flowing language
- Include visual details that matter
- Mention artistic style/aesthetic
- Don't use keyword lists

Example: "A young woman with flowing auburn hair wearing an elegant red evening gown, standing in a rain-soaked neon-lit Tokyo street at night, cyberpunk aesthetic with dramatic rim lighting"

Return ONLY the description as plain text (no JSON, no labels).`;

  return await generate({ prompt });
}

// Part 2: Action & Scene Dynamics
export async function generateActionDescription(params: {
  refinedScene: string;
  protagonistAction: string;
  isNsfw: boolean;
}): Promise<string> {
  const { refinedScene, protagonistAction, isNsfw } = params;

  const systemPrefix = isNsfw
    ? 'You are an expert Flux image prompt writer for adult content. Describe poses, positions, and physical details with explicit clarity. Use anatomically correct terms and precise descriptive language. Focus on visual composition and atmosphere.'
    : 'You are an expert Flux image prompt writer. Focus on composition, pose, and atmospheric details following Flux best practices.';

  const prompt = `${systemPrefix}

Add composition and pose details to this scene (50-70 words) following Flux principles.

Scene Foundation: "${refinedScene}"
Subject Action/Pose: "${protagonistAction}"

Structure your description:
- **Subject Pose/Action**: Describe the subject's pose, position, and what they're doing
- **Visual Composition**: How the scene is framed and composed
- Keep it descriptive and visually specific

Follow Flux guidelines:
- Use natural, descriptive language
- Be specific about positioning and composition
- Avoid keyword lists
- Focus on visual details

Example: "leaning against a weathered brick wall with arms crossed, body angled toward the camera, creating a dynamic diagonal composition with strong leading lines"

Return ONLY the composition description as plain text (no JSON, no labels).`;

  return await generate({ prompt });
}

// Part 3: Final Flux Image Prompts
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

  const systemPrefix = isNsfw
    ? 'You are an expert Flux image prompt writer for adult content. Create detailed, explicit image prompts. Use anatomically correct terms and explicit descriptions. Output JSON only.'
    : 'You are an expert Flux image prompt writer. Create detailed, descriptive prompts for image generation following Flux best practices. Output JSON only.';

  const prompt = `${systemPrefix}

Generate 3 complete Flux image prompt variations as a JSON array (150-250 words each). Each item has {"title": string, "prompt": string}.

Subject & Scene: "${actionDescription}"
Perspective: "${cameraAngle}"
Lighting: "${lighting}"
Color Palette: "${colorPalette}"
Mood/Atmosphere: "${mood}"
Composition: "${compositionType}"
Photography Style: "${cameraDevice ?? 'professional photography'}"

Flux Guidelines:
- Be specific and descriptive about the subject
- Include artistic style and aesthetic references
- Specify composition and framing details
- Describe lighting and color palette
- Mention mood and atmosphere
- Include technical photography details
- Use natural language, not keyword lists
- Balance detail with creative freedom
- Each prompt should be 150-250 words

Example: "A cyberpunk hacker in neon-lit room, vibrant electric colors, dramatic rim lighting, rule of thirds composition, shot on ARRI Alexa with anamorphic lens, moody and mysterious atmosphere"

Integrate all elements naturally into cohesive prompts.

Return ONLY a JSON array of 3 prompts.`;

  const text = await generate({ prompt });
  const json = extractJson<VideoPrompt[]>(text);
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

  const sys = isNsfw
    ? 'You are a master visual storyteller for tasteful adult content. Follow safety rules. '
    : 'You are a master visual storyteller for cinematic content. ';

  const prompt = `${sys}Generate 3 video prompt variations as a JSON array. Each item is an object with keys \"title\" and \"prompt\".\nRules:\n- 80–120 words each (max 140).\n- **CRITICAL: Build each prompt around the Main Scene description - it's your foundation. Use every detail from it.**\n- Weave camera angle and movement into narrative.\n- Combine elements cohesively.\n\nCriteria:\n- Main Scene (YOUR FOUNDATION): \"${scene}\"\n- Visual Style: \"${style}\"\n- Protagonist Action: \"${protagonistAction}\"\n- Camera Angle: \"${cameraAngle}\"\n- Camera Movement: \"${cameraMovement}\"\n- Camera/Device: \"${cameraDevice ?? ''}\"\n- Lighting: \"${lighting}\"`;

  const text = await generate({ prompt });
  const json = extractJson<VideoPrompt[]>(text);
  if (!Array.isArray(json)) throw new Error('Expected an array of prompts.');
  return json as VideoPrompt[];
}
