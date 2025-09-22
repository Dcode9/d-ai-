
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Chat } from '@google/genai';
import { useTheme } from './hooks/useTheme';
import { Message, ModelType, UploadedFile } from './types';
import { initializeChat, sendMessageToModel, generateImage, generateOrEditImageWithNanoBanana } from './services/geminiService';
import { Header } from './components/Header';
import { ChatHistory } from './components/ChatHistory';
import { MessageInput } from './components/MessageInput';
import { NanoBananaPopup } from './components/NanoBananaPopup';
import { IntroPopup } from './components/IntroPopup';


const TEXT_WELCOME_MESSAGE: Message = {
    id: 'initial-welcome',
    role: 'model',
    parts: [{
        text: `Hello! I'm **D'Ai (Gemini 2.5)** — your assistant for code, explanations, and images.`
    }]
};

const PAINT_WELCOME_MESSAGE: Message = {
    id: 'initial-paint-welcome',
    role: 'model',
    parts: [{
        text: `Welcome to **D'Ai - Paint**! 🍌\n\nI can create new images from your descriptions or edit photos you upload. Just describe what you want or drop in a file to get started.`
    }]
};

function App() {
    const { theme, toggleTheme } = useTheme();
    const [messages, setMessages] = useState<Message[]>([TEXT_WELCOME_MESSAGE]);
    const [isLoading, setIsLoading] = useState(false);
    const [modelType, setModelType] = useState<ModelType>('text');
    const [chat, setChat] = useState<Chat | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showNanoBananaPopup, setShowNanoBananaPopup] = useState(false);
    const [showIntroPopup, setShowIntroPopup] = useState(false);

    const headerRef = useRef<HTMLElement>(null);
    const footerRef = useRef<HTMLElement>(null);
    const [chatPadding, setChatPadding] = useState({ top: 0, bottom: 0 });

    useEffect(() => {
        if (!sessionStorage.getItem('introPopupShown')) {
            setShowIntroPopup(true);
        }
    }, []);

    useEffect(() => {
        if (modelType === 'text') {
            setChat(initializeChat());
            setMessages([TEXT_WELCOME_MESSAGE]);
        } else {
            setChat(null);
            setMessages([PAINT_WELCOME_MESSAGE]);
        }
    }, [modelType]);

    const handleSendMessage = useCallback(async (inputText: string, imageFile?: UploadedFile | null) => {
        if ((!inputText.trim() && !imageFile) || isLoading) return;

        const userMessageParts = [];
        if (imageFile) {
            userMessageParts.push({ imageData: imageFile.data });
        }
        if (inputText.trim()) {
            userMessageParts.push({ text: inputText });
        }

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            parts: userMessageParts
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);

        try {
            if (modelType === 'text' && chat) {
                const rawBotResponseParts = await sendMessageToModel(chat, inputText);
                const responseText = rawBotResponseParts.map(p => p.text || '').join('').trim();
                const imageActionPrefix = "[ACTION:GENERATE_IMAGE]";

                if (responseText.startsWith(imageActionPrefix)) {
                    const imagePrompt = responseText.substring(imageActionPrefix.length).trim();
                    
                    const confirmationMessage: Message = {
                        id: `model-${Date.now()}-confirm`,
                        role: 'model',
                        parts: [{ text: `OK, using Imagen to generate: *${imagePrompt}*` }]
                    };
                    setMessages(prev => [...prev, confirmationMessage]);

                    const imageUrl = await generateImage(imagePrompt);
                    const imageMessage: Message = {
                        id: `model-${Date.now()}-image`,
                        role: 'model',
                        parts: [{ imageData: imageUrl }]
                    };
                    setMessages(prev => [...prev, imageMessage]);

                } else {
                    const textMessage: Message = {
                        id: `model-${Date.now()}`,
                        role: 'model',
                        parts: rawBotResponseParts
                    };
                    setMessages(prev => [...prev, textMessage]);
                }

            } else if (modelType === 'image') {
                const botResponseParts = await generateOrEditImageWithNanoBanana(inputText, imageFile);
                const responseMessage: Message = {
                    id: `model-${Date.now()}`,
                    role: 'model',
                    parts: botResponseParts
                };
                setMessages(prev => [...prev, responseMessage]);

            } else {
                throw new Error("Invalid model type or chat not initialized.");
            }

        } catch (err) {
            console.error("Error communicating with Gemini API:", err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
            const errorBotMessage: Message = {
                id: `error-${Date.now()}`,
                role: 'model',
                parts: [{ text: `Sorry, something went wrong: ${errorMessage}` }]
            };
            setMessages(prev => [...prev, errorBotMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, modelType, chat]);

    const handleClearChat = useCallback(() => {
        const welcomeMsg = modelType === 'text' ? TEXT_WELCOME_MESSAGE : PAINT_WELCOME_MESSAGE;
        setMessages([welcomeMsg]);
        setError(null);
        if (modelType === 'text') {
            setChat(initializeChat());
        }
    }, [modelType]);

    const handleModelChange = useCallback((newModel: ModelType) => {
        if (newModel === modelType) return;

        setModelType(newModel);
        if (newModel === 'image' && !sessionStorage.getItem('nanoBananaPopupShown')) {
            setShowNanoBananaPopup(true);
            sessionStorage.setItem('nanoBananaPopupShown', 'true');
        }
    }, [modelType]);
    
    const handleTryPaintNow = () => {
        sessionStorage.setItem('introPopupShown', 'true');
        // Prevent the other popup from showing immediately after this one
        sessionStorage.setItem('nanoBananaPopupShown', 'true'); 
        setModelType('image'); // Directly set the model to switch
        setShowIntroPopup(false);
    };
    
    const handleCloseIntroPopup = () => {
        setShowIntroPopup(false);
        sessionStorage.setItem('introPopupShown', 'true');
    };

    useEffect(() => {
        const updatePadding = () => {
            const extra = 16;
            const top = (headerRef.current?.offsetHeight || 0) + extra;
            const bottom = (footerRef.current?.offsetHeight || 0) + extra;
            setChatPadding({ top, bottom });
        };

        updatePadding();
        const resizeObserver = new ResizeObserver(updatePadding);
        if (headerRef.current) resizeObserver.observe(headerRef.current);
        if (footerRef.current) resizeObserver.observe(footerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div className="animated-gradient-bg flex items-center justify-center min-h-screen p-2 sm:p-4">
            {showIntroPopup && <IntroPopup onClose={handleCloseIntroPopup} onTryNow={handleTryPaintNow} />}
            {showNanoBananaPopup && <NanoBananaPopup onClose={() => setShowNanoBananaPopup(false)} />}
            
            <div className="absolute inset-0 z-0">
                <div className="shape shape1"></div>
                <div className="shape shape2"></div>
            </div>

            <div className="relative w-full h-[100vh] sm:h-[90vh] sm:max-w-2xl rounded-none sm:rounded-[2.5rem] shadow-2xl glass-container overflow-hidden flex flex-col">
                <Header 
                  ref={headerRef}
                  currentModel={modelType}
                  onModelChange={handleModelChange}
                  onClearChat={handleClearChat}
                  theme={theme}
                  onThemeToggle={toggleTheme}
                />
                
                <ChatHistory
                    messages={messages}
                    isLoading={isLoading}
                    paddingTop={chatPadding.top}
                    paddingBottom={chatPadding.bottom}
                />

                <MessageInput
                    ref={footerRef}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    currentModel={modelType}
                />
            </div>
        </div>
    );
}

export default App;