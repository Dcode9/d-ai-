
import React from 'react';

export const ThinkingBubble: React.FC = () => {
    return (
        <div className="flex justify-start">
            <div className="message-bubble p-4" style={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                <div className="thinking-bar"></div>
            </div>
        </div>
    );
};
