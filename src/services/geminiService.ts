import { GoogleGenAI, Modality } from "@google/genai";
import type { RenderViewConfig, Angle } from '../types';
import { DESCRIBE_PRODUCT_PROMPT, RENDER_VIEWS_SYSTEM_PROMPT } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
// FIX: Use the correct models for different tasks. 'gemini-2.5-flash' is for general multimodal queries,
// while 'gemini-2.5-flash-image-preview' is specialized for image editing.
const describeModel = 'gemini-2.5-flash';
const imageEditModel = 'gemini-2.5-flash-image-preview';

const fileToGenerativePart = (base64: string, mimeType: string) => {
    return {
        inlineData: {
            data: base64,
            mimeType,
        },
    };
};

export const describeProduct = async (imageBase64: string, mimeType: string): Promise<string> => {
    const imagePart = fileToGenerativePart(imageBase64, mimeType);
    const response = await ai.models.generateContent({
        model: describeModel,
        contents: { parts: [imagePart, { text: DESCRIBE_PRODUCT_PROMPT }] },
    });
    return response.text;
};

export const renderView = async (config: RenderViewConfig): Promise<string> => {
    const { imageBase64, imageMimeType, productProfile, angle, backgroundMode, extras } = config;

    const prompt = `Task: Re-render the product from the reference image at the specified new camera angle.

REFERENCE IMAGE: (provided as image part)
PRODUCT PROFILE: ${productProfile}

CAMERA ANGLE: ${JSON.stringify(angle)}
BACKGROUND MODE: ${backgroundMode}
OPTIONAL INSTRUCTIONS: ${extras || 'None'}

Your task is to re-render the SAME product shown in the REFERENCE IMAGE from the specified new CAMERA ANGLE.

Requirements:
- Strictly follow all rules in the system prompt.
- Identity Preservation: The rendered product must be identical to the one in the reference image. Do NOT change its design, colors, materials, textures, proportions, or logos.
- Photorealism: The output must be a crisp, photorealistic image with correct perspective and foreshortening for the given angle.
- Background: Apply the BACKGROUND MODE rules. Include a soft, realistic contact shadow consistent with studio lighting.
- Scale & Framing: Maintain a consistent scale and framing for the product.

Generate a single image of the product from this new viewpoint.`;

    const imagePart = fileToGenerativePart(imageBase64, imageMimeType);
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: imageEditModel,
        contents: { parts: [imagePart, textPart] },
        config: {
            systemInstruction: RENDER_VIEWS_SYSTEM_PROMPT,
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }

    throw new Error('Image generation failed. The model did not return an image part.');
};
