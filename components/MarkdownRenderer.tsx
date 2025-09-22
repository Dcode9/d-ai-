import React, { useState, useEffect } from 'react';

// This tells TypeScript that `marked` is available as a global
// variable, since it's being loaded from a <script> tag.
declare const marked: any;

interface MarkdownRendererProps {
    content: string;
}

// Regex to find a fenced code block, capturing the language and the code.
// It now specifically looks for content that is ONLY a code block, trimmed of whitespace.
const CODE_BLOCK_REGEX = /^```(\w+)?\n([\s\S]+?)```\s*$/;

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const match = content.trim().match(CODE_BLOCK_REGEX);

    // If the content is exclusively a code block, render it in the special container.
    // This is the part you asked not to touch.
    if (match) {
        const language = match[1] || 'code';
        const code = match[2] || '';
        const [copyText, setCopyText] = useState('Copy');

        const handleCopy = () => {
            navigator.clipboard.writeText(code).then(() => {
                setCopyText('Copied!');
                setTimeout(() => setCopyText('Copy'), 2000);
            }).catch(() => {
                setCopyText('Failed!');
                setTimeout(() => setCopyText('Copy'), 2000);
            });
        };

        return (
            <div className="message-content">
                <div className="code-block-wrapper">
                    <div className="code-block-header">
                        <span>{language}</span>
                        <button className="copy-btn" onClick={handleCopy}>{copyText}</button>
                    </div>
                    <pre><code>{code}</code></pre>
                </div>
            </div>
        );
    }

    // For any other text (including text with inline code or other markdown),
    // use marked.js to parse it into HTML.
    const [html, setHtml] = useState('');

    useEffect(() => {
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                gfm: true,
                breaks: true,
                smartLists: true,
            });
            setHtml(marked.parse(content));
        } else {
            // Fallback for plain text if marked.js hasn't loaded yet.
            setHtml(content.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        }
    }, [content]);

    return (
        <div 
            className="message-content" 
            dangerouslySetInnerHTML={{ __html: html }} 
        />
    );
};