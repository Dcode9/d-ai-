import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";
import type { MessagePart, UploadedFile } from "../types";

// Ensure the API key is available, otherwise throw an error.
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const IMAGE_GENERATION_INSTRUCTION = `You are D'Ai, a helpful multimodal assistant. If the user asks you to generate, create, or draw an image, you MUST respond with only the text "[ACTION:GENERATE_IMAGE]" followed by a descriptive, stand-alone prompt that can be used to generate the image. For example, if the user says 'Can you draw me a picture of a robot holding a red skateboard?', you must respond with "[ACTION:GENERATE_IMAGE] A robot holding a red skateboard.". For all other requests, respond as a normal, helpful assistant.`;

/**
 * A shared helper function to process the `parts` array from a Gemini API response.
 * It safely handles text, images, and complex objects to prevent crashes.
 */
function _processResponseParts(parts: any[] | undefined): MessagePart[] {
    if (!parts || parts.length === 0) {
        return [];
    }
    
    return parts.map((part): MessagePart | null => {
        if (part.inlineData) {
            const { mimeType, data } = part.inlineData;
            return { imageData: `data:${mimeType};base64,${data}` };
        }
        
        if (part.text != null) {
             if (typeof part.text === 'string') {
                 return { text: part.text };
             } else if (typeof part.text === 'object') {
                 try {
                    const jsonString = JSON.stringify(part.text, null, 2);
                    return { text: `\`\`\`json\n${jsonString}\n\`\`\`` };
                 } catch (e) {
                     return { text: '[Unsupported content: Could not format object]' };
                 }
             }
        }
        return null; 
    }).filter((p): p is MessagePart => p !== null);
}


export function initializeChat(): Chat {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: IMAGE_GENERATION_INSTRUCTION,
        },
    });
}

export async function sendMessageToModel(chat: Chat, message: string): Promise<MessagePart[]> {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    
    const parts = response.candidates?.[0]?.content?.parts;

    if (!parts || parts.length === 0) {
        const finishReason = response.candidates?.[0]?.finishReason;
        if (finishReason && finishReason !== 'STOP') {
            return [{ text: `The response was stopped prematurely. Reason: ${finishReason}` }];
        }
        return [{ text: "I received a response, but it was empty." }];
    }
    
    const messageParts = _processResponseParts(parts);

    if (messageParts.length === 0) {
        return [{ text: "I received a response, but it contained no displayable content." }];
    }

    return messageParts;
}

/**
 * Generates an image using the Imagen model, triggered by the text assistant.
 */
export async function generateImage(prompt: string): Promise<string> {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    }

    throw new Error("Image generation failed or returned no images.");
}

/**
 * Generates or edits an image using the "Nano Banana" model.
 * Handles both text-to-image and image-to-image tasks.
 */
export async function generateOrEditImageWithNanoBanana(prompt: string, image?: UploadedFile | null): Promise<MessagePart[]> {
    const modelParts: any[] = [];

    if (image) {
        const base64Data = image.data.split(',')[1];
        if (!base64Data) throw new Error("Invalid image data URL format.");
        
        modelParts.push({
            inlineData: { data: base64Data, mimeType: image.mimeType },
        });
    }

    if (prompt) {
        modelParts.push({ text: prompt });
    }

    if (modelParts.length === 0) {
        throw new Error("A prompt or an image is required to generate content.");
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: modelParts },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    const messageParts = _processResponseParts(parts);

    if (messageParts.length === 0) {
        const finishReason = response.candidates?.[0]?.finishReason;
        if (finishReason && finishReason !== 'STOP') {
            return [{ text: `Nano Banana stopped prematurely. Reason: ${finishReason}` }];
        }
        return [{ text: "Nano Banana returned an empty response." }];
    }
    
    return messageParts;
}
