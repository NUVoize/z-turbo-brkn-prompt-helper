import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { VideoPrompt } from '../types.ts';

let ai: GoogleGenerativeAI | null = null;

const getApiKey = (): string | null => {
  try {
    console.log('Checking for API key...');
    const fromEnv = (process.env.API_KEY as string) || (process.env.GEMINI_API_KEY as string);
    const fromStorage = typeof window !== 'undefined' ? window.localStorage.getItem('GEMINI_API_KEY') : null;
    console.log('Environment key available:', !!fromEnv);
    console.log('LocalStorage key available:', !!fromStorage);
    const finalKey = fromEnv || fromStorage;
    console.log('Final key available:', !!finalKey);
    return finalKey;
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
};

const getBaseUrl = (): string | undefined => {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem('GEMINI_BASE_URL') || undefined : undefined;
  } catch (error) {
    console.error('Error getting base URL:', error);
    return undefined;
  }
};

const getAI = (): GoogleGenerativeAI => {
  console.log('Initializing Google Generative AI...');
  const key = getApiKey();
  if (!key) {
    console.error('No API key found');
    throw new Error("Gemini API key is not configured. Set GEMINI_API_KEY at build time or save it in localStorage under 'GEMINI_API_KEY'.");
  }
  
  console.log('Creating GoogleGenerativeAI instance...');
  const baseUrl = getBaseUrl();
  // Always create a new instance to ensure we use the latest API key from localStorage
  // Note: Custom base URLs are not officially supported by Google Generative AI SDK
  if (baseUrl) {
    console.log('Custom base URL provided, but not supported by official Gemini SDK:', baseUrl);
  }
  ai = new GoogleGenerativeAI(key);
  console.log('GoogleGenerativeAI instance created successfully');
  return ai;
};

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

const promptsSchema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.STRING,
        description: 'A short, descriptive title for this prompt variation (e.g., "Cinematic Drone Shot").'
      },
      prompt: {
        type: SchemaType.STRING,
        description: 'The full, detailed video prompt text, combining all elements into a coherent paragraph.'
      }
    },
    required: ['title', 'prompt']
  }
};

const promptToJsonSchema = {
    type: SchemaType.OBJECT,
    properties: {
        scene_description: {
            type: SchemaType.STRING,
            description: 'A detailed summary of the main scene, setting, and environment.'
        },
        visual_style: {
            type: SchemaType.STRING,
            description: 'The overall visual style or aesthetic (e.g., Cinematic, Anime, Vintage Film).'
        },
        protagonist_action: {
            type: SchemaType.STRING,
            description: 'The primary action the main character is performing.'
        },
        camera_angle: {
            type: SchemaType.STRING,
            description: 'The camera angle used for the shot (e.g., Wide Shot, Low-Angle Shot).'
        },
        camera_movement: {
            type: SchemaType.STRING,
            description: 'The movement of the camera during the shot (e.g., Static, Pan Left, Dolly In).'
        },
        lighting_details: {
            type: SchemaType.STRING,
            description: 'A description of the lighting setup and mood.'
        },
        additional_keywords: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.STRING
            },
            description: 'Any other relevant keywords or tags from the prompt.'
        }
    },
    required: ['scene_description', 'visual_style', 'protagonist_action', 'camera_angle', 'camera_movement', 'lighting_details']
};


interface PromptGenerationParams {
    scene: string;
    style: string;
    protagonistAction: string;
    cameraAngle: string;
    cameraMovement: string;
    lighting: string;
    isNsfw: boolean;
    cameraDevice?: string;
}

interface CaptionGenerationParams {
    imageData: string; // base64 string without the 'data:mime/type;base64,' prefix
    mimeType: string;
    isNsfw: boolean;
}

export const generateCaptionFromImage = async (params: CaptionGenerationParams): Promise<string[]> => {
    try {
        console.log('Starting generateCaptionFromImage...');
        const { imageData, mimeType, isNsfw } = params;

        const sfwPrompt = `Analyze this image and produce exactly 3 rich, detailed caption options (each 100-150 words) optimized for Z-Image-Turbo. Z-Turbo excels with LONG, DETAILED, STRUCTURED prompts. When a person is the main subject/protagonist in the image, lead with detailed physicality, then describe the action, feelings, mood, and environment:

**Lead with Physicality (when applicable):**
- Race/Ethnicity (Slavic, Asian, African, etc.)
- Hair color/style/length
- Body type and size (petite, athletic, curvy, muscular, slim, voluptuous)
- Breast size (when relevant: small perky, medium full, large heavy)
- Height and proportions
- Notable features (freckles, dimples, scars, tattoos, piercings)
- Clothing details (fabrics, colors, fit, style)

**Then add Action & Sensory Details:**
- What they're doing (action/pose with body mechanics)
- Sensory details (how things feel - cool metal, warm skin, rough fabric, soft sheets)
- Body positioning and spatial relationships

**Describe Feelings & Environment:**
- Emotional atmosphere (tension, serenity, passion, melancholy, excitement)
- Environmental mood (cozy, sterile, chaotic, intimate, oppressive)
- Lighting quality and how it affects the mood and surfaces
- Setting details that enhance the emotional tone
- Color palette and tones

**Examples:**
SFW: "A broad-shouldered African American man approximately 6'2" with tight curly black hair and defined abs is mid-pullup in a dimly lit industrial gym, wearing only black athletic shorts. His muscular biceps bulge and prominent veins stand out against his dark ebony skin as he strains upward, jaw clenched with determination. The atmosphere is gritty and focused, with rays of golden hour sunlight cutting dramatically through dusty windows, creating sharp shadows across worn concrete floors scattered with old equipment. The air feels heavy with effort and ambition, while the warm amber light contrasts with cool blue shadows in the corners."

NSFW: "A petite Asian woman with long straight black hair cascading past her shoulders, large full breasts, and slender legs stands in semi-transparent black lace lingerie. She's around 5'3" with an hourglass figure, her porcelain pale skin glowing softly in warm amber lamplight from a bedside table lamp, with a small birthmark visible just below her left collarbone. Her brown almond-shaped eyes gaze directly at the viewer with a mix of vulnerability and invitation. The bedroom atmosphere is thick with anticipation and desire, with crimson silk sheets catching the light behind her, their sheen emphasizing the intimate setting. The space feels hushed and private, with soft shadows creating depth."

Return exactly 3 captions as a JSON array of strings. Each caption should be 100-150 words, DETAILED and STRUCTURED for Z-Image-Turbo.`;

        const nsfwPrompt = `Analyze this image and produce exactly 3 EXTREMELY DETAILED, EXPLICIT caption options (each 150-250 words) optimized for Z-Image-Turbo. Z-Turbo LOVES EXTREMELY LONG, DETAILED, STRUCTURED prompts. This is NSFW adult content - BE EXPLICIT and ANATOMICALLY PRECISE:

**LEAD WITH EXPLICIT PHYSICALITY (MANDATORY - BE EXTREMELY DETAILED):**
- Race/Ethnicity with exact skin tone details (pale ivory, golden tan, olive, deep ebony, caramel, etc.)
- Hair: exact color, length, style, texture (straight, wavy, curly, coiled)
- Body type: exact build with measurements where relevant (slim, toned, athletic, curvy, voluptuous, petite, plus-size)
- Breasts: EXACT size and shape (small perky A-cup, medium full B/C-cup, large heavy DD/E-cup, etc.) - describe nipple size/color/visibility, areola size and color
- Height and exact body proportions (long legs, short torso, wide hips, narrow waist, thick thighs, etc.)
- Intimate details: body hair (shaved, trimmed, natural, landing strip), pubic region if visible, intimate piercings, genital jewelry, tattoos with placement
- Genitalia: when visible, describe explicitly (penis size/length/girth/state of arousal, vulva appearance/labia shape/color, etc.)
- State of undress: describe EXACTLY what's exposed and what's covered, including underwear details

**EXPLICIT ACTION & POSITIONS (BE EXTREMELY SPECIFIC):**
- Exact sexual position or pose with anatomical precision (angles, body part placement)
- Body parts in contact (where exactly hands/mouths/genitals/skin touches)
- Explicit sexual acts being performed with mechanical detail
- Physical reactions (arousal indicators, body responses, muscle tension, facial expressions)
- Sensory details (skin texture, wetness/moisture, body temperature, friction, pressure points)
- Body mechanics (how they're supporting themselves, weight distribution, muscle engagement)

**SEXUAL ATMOSPHERE & CONTEXT (RICH ENVIRONMENTAL DETAIL):**
- Emotional state (lust, desire, passion, submission, dominance, vulnerability, confidence)
- Lighting on naked/exposed skin (how light hits curves, highlights, shadows on body)
- Sexual tension and energy in the scene
- Environmental details that enhance the erotic mood (textures, colors, sounds, temperature)
- Setting specifics (furniture, props, location details)
- Color palette and how it affects the mood

**EXAMPLE:**
"A voluptuous Caucasian woman, approximately 5'6" tall in her late 20s with cascading wavy blonde hair reaching mid-back and piercing blue eyes, completely nude with large heavy breasts (38DD cup) featuring prominent erect pink nipples approximately 1 inch in diameter and large pale areolas. She has a soft hourglass figure with wide 38-inch hips, thick thighs, a narrow 26-inch waist, and a neatly groomed blonde landing strip of pubic hair pointing toward her exposed vulva. She's positioned on crimson silk sheets in a candlelit bedroom with warm amber lighting from multiple candles casting flickering shadows on her pale ivory skin which glistens with a light sheen of perspiration. Her legs are spread wide in a submissive pose with knees bent and feet flat on the bed, hands placed behind her head with elbows out, back deeply arched to thrust her large breasts upward and create maximum exposure of her torso and intimate areas. Her full lips are parted with tongue slightly visible, eyes half-closed with an expression mixing anticipation and desire. The atmosphere is intensely sexual and thick with tension, the warm candlelight creating dramatic shadows that emphasize every curve, valley, and contour of her exposed body. Goosebumps are visible on her thighs and arms despite the warm room temperature, indicating heightened arousal. Her vulnerable exposed position radiates both nervousness and intense desire, with her accelerated breathing evident from the rise and fall of her chest."

BE EXTREMELY EXPLICIT. Use anatomically correct terms. Describe sexual content with MAXIMUM precision and detail. Target 150-250 words per caption for Z-Image-Turbo's optimal prompt length.

Return exactly 3 captions as a JSON array of strings.`;

        const prompt = isNsfw ? nsfwPrompt : sfwPrompt;

        console.log('Creating Gemini model...');
        const model = getAI().getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                },
                temperature: 0.7,
            }
        });

        console.log('Generating content...');
        const response = await model.generateContent([
            { inlineData: { data: imageData, mimeType } },
            prompt
        ]);

        // Check if response was blocked
        const promptFeedback = response.response.promptFeedback;
        if (promptFeedback?.blockReason) {
            const blockReason = promptFeedback.blockReason;
            console.error('Response blocked by Gemini:', blockReason);
            throw new Error(
                `Content was blocked by Gemini's safety filters (${blockReason}). ` +
                `This could be due to the image content or the prompt. ` +
                `Try a different image or switch to another LLM provider in settings.`
            );
        }

        console.log('Parsing response...');
        const jsonText = response.response.text().trim();
        console.log('Raw response:', jsonText.substring(0, 200));
        
        const captions = extractJson<string[]>(jsonText);

        if (!Array.isArray(captions)) {
            throw new Error("API did not return an array of captions.");
        }

        console.log('Successfully generated captions');
        return captions as string[];

    } catch (error) {
        console.error("Error generating caption from image:", error);
        console.error("Error details:", error instanceof Error ? error.message : String(error));
        let errorMessage = "Failed to generate caption from image. The API returned an unexpected response.";
        if (error instanceof Error) {
            errorMessage = `Failed to generate caption from image: ${error.message}`;
        }
        throw new Error(errorMessage);
    }
};

export const transformPromptToJson = async (promptText: string): Promise<object> => {
    try {
        const prompt = `Analyze the following video prompt text and break it down into a structured JSON object. Extract the core components based on the provided schema.

Video Prompt: "${promptText}"`;
        
        const model = getAI().getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: promptToJsonSchema,
                temperature: 0.1,
            }
        });
        const response = await model.generateContent(prompt);

        const jsonText = response.response.text().trim();
        return extractJson<object>(jsonText);

    } catch (error) {
        console.error("Error transforming prompt to JSON:", error);
        let errorMessage = "Failed to transform prompt to JSON. The API returned an unexpected response.";
        if (error instanceof Error) {
            errorMessage = `Failed to transform prompt to JSON: ${error.message}`;
        }
        throw new Error(errorMessage);
    }
};

// Part 1: Generate Subject and Artistic Style
export const generateCaptionAndCharacter = async (params: {
  scene: string;
  style: string;
  isNsfw: boolean;
}): Promise<string> => {
  try {
    console.log('[Gemini] Part 1: Generating Subject & Style...');
    const { scene, style, isNsfw } = params;

    const systemInstruction = isNsfw 
      ? 'You are an expert Z-Image-Turbo prompt writer specializing in adult content. Z-Image-Turbo excels with LONG, DETAILED, STRUCTURED prompts (100-150 words). Use explicit, anatomically precise terminology. Describe bodies, features, and settings with maximum detail and clarity.'
      : 'You are an expert Z-Image-Turbo prompt writer. Z-Image-Turbo works best with LONG, DETAILED, STRUCTURED prompts (80-120 words). Focus on precise subject and scene descriptions with rich visual detail.';

    const prompt = `${systemInstruction}

Create a detailed subject and scene description (80-120 words) following Z-Image-Turbo image generation principles.

**Subject/Scene:** "${scene}"
**Artistic Style:** "${style}"

Z-Image-Turbo requires STRUCTURED, DETAILED prompts. Structure your description:

1. **Subject Description (detailed physicality)**: 
   - Ethnicity/race, age, body type
   - Hair color/style, facial features
   - Clothing/wardrobe with specific details
   - Notable features (tattoos, accessories, etc.)

2. **Scene Setting & Environment**: 
   - Specific location and setting details
   - Environmental atmosphere and mood
   - Lighting quality and how it affects the scene
   - Background elements and composition

Follow Z-Turbo guidelines:
- Be LONG and DETAILED (Z-Turbo excels with verbose prompts)
- Use structured, flowing paragraphs (not keyword lists)
- Include specific physical and environmental details
- Mention artistic style/aesthetic
- Token limit: aim for 150-200 tokens

Example: "A petite Asian woman in her mid-20s with long straight black hair and almond-shaped brown eyes, wearing a flowing crimson silk qipao with gold embroidery, standing in a rain-soaked neon-lit Tokyo street at night. Her porcelain skin glows under the pink and blue neon signs reflecting off wet pavement. The cyberpunk aesthetic features dramatic rim lighting from holographic advertisements, creating an atmospheric blend of traditional elegance and futuristic grit."

Generate a vivid, LONG, detailed description following Z-Image-Turbo principles.`;

    const model = getAI().getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: isNsfw ? 0.9 : 0.7,
      }
    });
    
    const response = await model.generateContent(prompt);
    const result = response.response.text().trim();
    console.log('[Gemini] Part 1 complete:', result.substring(0, 100));
    return result;

  } catch (error) {
    console.error("[Gemini] Error in Part 1:", error);
    throw new Error(`Part 1 failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Part 2: Generate Composition and Mood
export const generateActionDescription = async (params: {
  refinedScene: string;
  protagonistAction: string;
  isNsfw: boolean;
}): Promise<string> => {
  try {
    console.log('[Gemini] Part 2: Generating Composition & Mood...');
    const { refinedScene, protagonistAction, isNsfw } = params;

    const systemInstruction = isNsfw
      ? 'You are an expert Z-Image-Turbo prompt writer for adult content. Z-Turbo excels with LONG, DETAILED descriptions (100-150 words). Describe poses, positions, and physical details with explicit clarity and rich atmospheric detail. Use anatomically correct terms and extensive descriptive language.'
      : 'You are an expert Z-Image-Turbo prompt writer. Z-Turbo works best with LONG, DETAILED descriptions (60-100 words). Focus on composition, pose, and rich atmospheric details.';

    const prompt = `${systemInstruction}

Add detailed composition, pose, and action details to this scene (60-100 words) following Z-Image-Turbo principles.

**Scene Foundation:** "${refinedScene}"
**Subject Action/Pose:** "${protagonistAction}"

Z-Image-Turbo requires LONG, DETAILED descriptions. Structure your addition:

- **Subject Pose/Action**: Describe the subject's exact pose, body position, hand placement, what they're doing with rich physical detail
- **Visual Composition**: How the scene is framed, layered, and composed (foreground/midground/background)
- **Spatial Relationships**: How elements relate in 3D space
- Keep it LONG, descriptive, and visually specific

Follow Z-Turbo guidelines:
- Be VERBOSE and DETAILED (Z-Turbo loves long prompts)
- Use natural, flowing descriptive language (not keyword lists)
- Be specific about positioning, angles, and spatial composition
- Include sensory and atmospheric details
- Token target: 100-150 tokens

Example: "leaning against a rain-weathered brick wall with arms crossed over chest, body angled at 45 degrees toward the camera with weight shifted to left leg, right shoulder pressed against the rough textured wall. The pose creates a dynamic diagonal composition with strong leading lines from the brick pattern converging toward the subject. Her head is tilted slightly, gaze directed over left shoulder with a mix of confidence and intrigue, while diffused street light creates dramatic rim lighting along her silhouette."

Generate a vivid, LONG, detailed composition description following Z-Image-Turbo principles.`;

    const model = getAI().getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: isNsfw ? 0.9 : 0.7,
      }
    });
    
    const response = await model.generateContent(prompt);
    const result = response.response.text().trim();
    console.log('[Gemini] Part 2 complete:', result.substring(0, 100));
    return result;

  } catch (error) {
    console.error("[Gemini] Error in Part 2:", error);
    throw new Error(`Part 2 failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Part 3: Generate Final Z-Image-Turbo Prompts
export const generateFinalPrompts = async (params: {
  actionDescription: string;
  cameraAngle: string;
  lighting: string;
  colorPalette: string;
  mood: string;
  compositionType: string;
  isNsfw: boolean;
  cameraDevice?: string;
}): Promise<VideoPrompt[]> => {
  try {
    console.log('[Gemini] Part 3: Generating Final Z-Image-Turbo Prompts...');
    const { actionDescription, cameraAngle, lighting, colorPalette, mood, compositionType, isNsfw, cameraDevice } = params;

    const systemInstruction = isNsfw
      ? 'You are an expert Z-Image-Turbo prompt writer specializing in adult content. Create focused, efficient prompts (100-150 words). Output JSON only.'
      : 'You are an expert Z-Image-Turbo prompt writer. Create focused, efficient prompts (80-120 words). Output JSON only.';

    const prompt = `${systemInstruction}

Generate 3 concise Z-Image-Turbo prompts as JSON. Each item has {"title": string, "prompt": string}.

**Subject & Scene:** "${actionDescription}"
**Perspective:** "${cameraAngle}"
**Lighting:** "${lighting}"
**Color Palette:** "${colorPalette}"
**Mood/Atmosphere:** "${mood}"
**Composition:** "${compositionType}"
**Photography Style:** "${cameraDevice || 'professional photography'}"

Guidelines:
- Keep prompts focused (${isNsfw ? '100-150' : '80-120'} words)
- Subject description: physical traits, clothing/state, pose
- Environment: key location details only
- Technical: lighting, composition, camera style
- ${isNsfw ? 'Include explicit anatomical details directly' : 'Focus on artistic and photographic qualities'}
- Natural flowing sentences, not keyword lists

Integrate all elements naturally into concise, vivid prompts. Each variation should be unique with a creative title.`;

    const model = getAI().getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: promptsSchema,
        temperature: isNsfw ? 0.9 : 0.8,
      }
    });
    
    const response = await model.generateContent(prompt);
    const jsonText = response.response.text().trim();
    const prompts = extractJson<VideoPrompt[]>(jsonText);
    
    if (!Array.isArray(prompts)) {
      throw new Error("API did not return an array of prompts.");
    }
    
    console.log('[Gemini] Part 3 complete: Generated', prompts.length, 'Z-Turbo prompts');
    return prompts;

  } catch (error) {
    console.error("[Gemini] Error in Part 3:", error);
    throw new Error(`Part 3 failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Legacy function kept for backward compatibility
export const generatePrompts = async (params: PromptGenerationParams): Promise<VideoPrompt[]> => {
  try {
    console.log('Starting generatePrompts...');
    const { scene, style, protagonistAction, cameraAngle, cameraMovement, lighting, isNsfw, cameraDevice } = params;
    
    const examples = `**Example 1 (Narrative with Camera Action):** "A little girl, lost in the city and separated from her parents in New York's Times Square, looks up. The camera tilts up, following her gaze. Starting from the ground, it slowly reveals the massive, glittering, and dizzying skyscrapers and billboards, powerfully emphasizing her smallness and helplessness in a vast world."

**Example 2 (Stylized Shot Description):** "Fashion magazine, motion blur, handheld camera, a close-up photo of a group of 18-year-old hippie goths at a warehouse party, horror movie style, cinematic, hyper-realistic, photorealistic."

**Example 3 (Juxtaposition with Camera Movement):** "A display window on a commercial street in a bustling city. The camera moves to the left, slowly panning across the window of a luxury store, which contains glamorous mannequins and expensive merchandise. The camera continues to the left, moving away from the window to reveal a homeless person in ragged clothes, shivering in the corner of an adjacent alley."

**Example 4 (Detailed Character Shot):** "soft lighting, low contrast lighting, medium shot, daylight, backlighting, clean single shot.In a full, eye-level shot, a Caucasian man is lying on the floor. He is wearing a white T-shirt and blue jeans, and has curly, fluffy hair. His legs are crossed, with one hand resting on his stomach while the other is playing with a necklace. Next to him, there is a green plant, and on the floor, there is also a pen and some other items. In the background, there are white walls with a patterned design, and the man is leaning against a black and white cushion."`;

    const nsfwSystemInstruction = `You are a master visual storyteller and cinematographer with expertise in adult, 18+ themes. Your task is to generate 3 distinct and highly descriptive video prompts for an adult audience, suitable for advanced AI video generation. The prompts can be erotic, sensual, or explore mature, provocative themes.

While the themes are mature, you must adhere to safety guidelines. Do not generate content that is illegal, hateful, depicts non-consensual acts, or graphic violence. Focus on artistic, cinematic, and evocative descriptions that are suggestive and tasteful rather than explicit.`;

    const sfwSystemInstruction = `You are a master visual storyteller and cinematographer. Your task is to generate 3 distinct and highly descriptive video prompts suitable for advanced AI video generation models like Sora, Runway, or Pika.`;
    
    const wordCountLimiter = "IMPORTANT: Each generated prompt description must be between 80 and 120 words. Do not exceed 140 words under any circumstances."

    const systemInstruction = isNsfw ? nsfwSystemInstruction : sfwSystemInstruction;

    const prompt = `${systemInstruction}

${wordCountLimiter}

Follow the style of these examples, where camera work is seamlessly integrated into a narrative description:

${examples}

Now, using the following criteria, generate 3 new variations. For each variation:
1.  Write a detailed, paragraph-long prompt.
2.  **CRITICAL: You MUST build your prompt around the Main Scene description provided. This is the foundation - incorporate every detail from it.**
3.  **Crucially, weave the specified camera angle and movement directly into the narrative.** Describe what the camera *does* as part of the action, rather than just listing it as a tag.
4.  Combine all elements into a cohesive and evocative scene that stays true to the Main Scene description.
5.  Provide a short, creative title that captures the essence of the shot.

**Criteria for Generation:**
- **Main Scene (USE THIS AS YOUR FOUNDATION):** "${scene}"
- **Visual Style:** "${style}"
- **Protagonist Action:** "${protagonistAction}"
- **Camera Angle:** "${cameraAngle}"
- **Camera Movement:** "${cameraMovement}"
- **Camera/Device:** "${cameraDevice ?? ''}"
- **Lighting:** "${lighting}"`;

    console.log('Creating Gemini model for prompts...');
    const model = getAI().getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: promptsSchema,
        temperature: isNsfw ? 0.9 : 0.8,
      }
    });
    
    console.log('Generating content...');
    const response = await model.generateContent(prompt);

    // Check if response was blocked
    const promptFeedback = response.response.promptFeedback;
    if (promptFeedback?.blockReason) {
        const blockReason = promptFeedback.blockReason;
        console.error('Response blocked by Gemini:', blockReason);
        throw new Error(
            `Content was blocked by Gemini's safety filters (${blockReason}). ` +
            `This could be due to your prompt content. ` +
            `Try adjusting your scene description or switch to another LLM provider in settings.`
        );
    }

    console.log('Parsing response...');
    const jsonText = response.response.text().trim();
    console.log('Raw response:', jsonText.substring(0, 200));
    
    const generatedPrompts = extractJson<VideoPrompt[]>(jsonText);
    
    if (!Array.isArray(generatedPrompts)) {
        throw new Error("API did not return an array of prompts.");
    }

    console.log('Successfully generated prompts');
    return generatedPrompts as VideoPrompt[];

  } catch (error) {
    console.error("Error generating prompts:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    let errorMessage = "Failed to generate prompts. The API returned an unexpected response.";
    if (error instanceof Error) {
        errorMessage = `Failed to generate prompts: ${error.message}`;
    }
    throw new Error(errorMessage);
  }
};