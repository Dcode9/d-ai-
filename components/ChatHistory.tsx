
import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { ThinkingBubble } from './ThinkingBubble';

interface ChatHistoryProps {
    messages: Message[];
    isLoading: boolean;
    paddingTop: number;
    paddingBottom: number;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isLoading, paddingTop, paddingBottom }) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            const element = chatContainerRef.current;
            element.scrollTo({
                top: element.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages, isLoading]);

    return (
        <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto chat-container space-y-4 p-4 sm:p-6 scroll-smooth"
            style={{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}
        >
            {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && <ThinkingBubble />}
        </div>
    );
};
