
import React from 'react';
import type { Message } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageBubbleProps {
    message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const { role, parts } = message;
    const isUser = role === 'user';

    const wrapperClasses = isUser ? 'flex justify-end' : 'flex justify-start';
    const bubbleClasses = isUser
        ? 'message-bubble message-bubble-user text-white p-4 shadow-md rounded-tl-2xl rounded-tr-lg rounded-bl-2xl rounded-br-2xl'
        : 'message-bubble message-bubble-bot p-4 shadow-md rounded-tl-lg rounded-tr-2xl rounded-br-2xl rounded-bl-2xl';

    return (
        <div className={wrapperClasses}>
            <div className={bubbleClasses}>
                {parts.map((part, index) => {
                    if (part.imageData) {
                        return <img key={index} src={part.imageData} alt="Generated content" className="rounded-lg" />;
                    }
                    if (part.text) {
                        return <MarkdownRenderer key={index} content={part.text} />;
                    }
                    return null;
                })}
            </div>
        </div>
    );
};