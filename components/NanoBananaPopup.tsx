
import React from 'react';

interface NanoBananaPopupProps {
    onClose: () => void;
}

export const NanoBananaPopup: React.FC<NanoBananaPopupProps> = ({ onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="glass-panel p-8 rounded-3xl text-center max-w-sm shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <h2 className="text-2xl font-bold text-[color:var(--text-primary)] mb-4">
                    D'Ai Paint Upgraded!
                </h2>
                <p className="text-lg text-[color:var(--text-secondary)]">
                    Now powered by Google's Nano Banana 🍌 for incredible image editing and creation.
                </p>
                <button 
                    onClick={onClose} 
                    className="mt-6 bg-blue-500 text-white font-semibold py-2 px-6 rounded-full hover:bg-blue-600 active:bg-blue-700 transition shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                >
                    Try it!
                </button>
            </div>
        </div>
    );
};
