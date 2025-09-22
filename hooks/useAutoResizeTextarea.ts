
import { useEffect } from 'react';

export const useAutoResizeTextarea = (textareaRef: React.RefObject<HTMLTextAreaElement>, value: string) => {
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [textareaRef, value]);
};
