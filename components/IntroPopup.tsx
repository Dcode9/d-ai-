import React from 'react';

interface IntroPopupProps {
    onClose: () => void;
    onTryNow: () => void;
}

export const IntroPopup: React.FC<IntroPopupProps> = ({ onClose, onTryNow }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="glass-panel p-8 rounded-3xl text-center max-w-sm shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-[color:var(--text-primary)] mb-4">
                    Discover D'Ai - Paint! 🍌
                </h2>
                <p className="text-lg text-[color:var(--text-secondary)]">
                    Edit photos or create images from scratch with the new Nano Banana model.
                </p>
                <div className="mt-6 flex justify-center space-x-4">
                    <button 
                        onClick={onClose} 
                        className="bg-gray-500/50 text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-600/60 active:bg-gray-700/70 transition shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                    >
                        Later
                    </button>
                    <button 
                        onClick={onTryNow} 
                        className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-full hover:bg-blue-600 active:bg-blue-700 transition shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                    >
                        Try Now
                    </button>
                </div>
            </div>
        </div>
    );
};
