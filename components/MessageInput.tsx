
import React, { useState, useRef, forwardRef } from 'react';
import { useAutoResizeTextarea } from '../hooks/useAutoResizeTextarea';
import type { ModelType, UploadedFile } from '../types';

interface MessageInputProps {
    onSendMessage: (message: string, file?: UploadedFile | null) => void;
    isLoading: boolean;
    currentModel: ModelType;
}

export const MessageInput = forwardRef<HTMLElement, MessageInputProps>(({ onSendMessage, isLoading, currentModel }, ref) => {
    const [inputValue, setInputValue] = useState('');
    const [selectedFile, setSelectedFile] = useState<UploadedFile & { name: string } | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useAutoResizeTextarea(textareaRef, inputValue);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedFile({
                    data: e.target?.result as string,
                    mimeType: file.type,
                    name: file.name,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = () => {
        if ((inputValue.trim() || selectedFile) && !isLoading) {
            onSendMessage(inputValue, selectedFile);
            setInputValue('');
            setSelectedFile(null);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };
    
    const placeholderText = currentModel === 'text' 
        ? 'Type your message...' 
        : 'Upload an image and/or describe...';

    return (
        <footer className="absolute bottom-0 left-0 right-0 p-4 z-10" ref={ref}>
            {selectedFile && (
                <div className="px-1 pb-2">
                    <div className="glass-panel p-2 rounded-xl flex items-center justify-between animate-fade-in">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <img src={selectedFile.data} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="Image preview"/>
                            <span className="text-sm text-[color:var(--text-secondary)] truncate">{selectedFile.name}</span>
                        </div>
                        <button 
                            onClick={() => setSelectedFile(null)} 
                            className="text-2xl text-[color:var(--text-secondary)] w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/20"
                            aria-label="Remove image"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
            <div className="flex items-end space-x-3">
                {currentModel === 'image' && (
                    <>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/png, image/jpeg, image/webp" 
                            hidden 
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className="bg-gray-500/50 text-white font-semibold p-3 rounded-full h-12 w-12 flex-shrink-0 flex items-center justify-center hover:bg-gray-600/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition shadow-lg disabled:bg-gray-400/50 disabled:cursor-not-allowed"
                            aria-label="Upload image"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                        </button>
                    </>
                )}
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="glass-panel flex-1 p-3 border border-transparent rounded-3xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-[color:var(--text-primary)] placeholder-[color:var(--text-secondary)]"
                    placeholder={placeholderText}
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || (!inputValue.trim() && !selectedFile)}
                    className="bg-blue-500 text-white font-semibold p-3 rounded-full h-12 w-12 flex-shrink-0 flex items-center justify-center hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
            </div>
        </footer>
    );
});