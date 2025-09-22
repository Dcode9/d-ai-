
export type Role = 'user' | 'model';

export type ModelType = 'text' | 'image';

export interface UploadedFile {
    data: string; // Base64 data URL
    mimeType: string;
}

export interface MessagePart {
    text?: string;
    imageData?: string; // Base64 encoded image data URL
}

export interface Message {
    id: string;
    role: Role;
    parts: MessagePart[];
}