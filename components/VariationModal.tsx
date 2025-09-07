import React, { useState, useCallback } from 'react';
import type { GeneratedImage } from '../types';
import { generateScene } from '../services/geminiService';

interface VariationModalProps {
    isOpen: boolean;
    onClose: () => void;
    sourceImage: GeneratedImage | null;
}

export const VariationModal: React.FC<VariationModalProps> = ({ isOpen, onClose, sourceImage }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleClose = () => {
        setPrompt('');
        setResultImage(null);
        setError(null);
        setIsLoading(false);
        onClose();
    };

    const handleGenerate = useCallback(async () => {
        if (!sourceImage?.src || !prompt) return;

        setIsLoading(true);
        setResultImage(null);
        setError(null);

        try {
            const base64Data = sourceImage.src.split(',')[1];
            // Infer mimeType from src string, default to image/png
            const mimeTypeMatch = sourceImage.src.match(/data:(image\/\w+);/);
            const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';

            const newImageBase64 = await generateScene(base64Data, mimeType, prompt);
            setResultImage(`data:image/png;base64,${newImageBase64}`);
        } catch (err) {
            console.error("Failed to generate scene:", err);
            setError(err instanceof Error ? err.message : 'Failed to create scene.');
        } finally {
            setIsLoading(false);
        }
    }, [sourceImage, prompt]);

    const handleDownload = () => {
        if (!resultImage) return;
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = `variation_${sourceImage?.name || 'image'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={handleClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl border border-gray-700 shadow-2xl m-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-indigo-400">Create a New Scene</h2>
                    <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Source Image</label>
                            <img src={sourceImage?.src ?? ''} alt={sourceImage?.name} className="rounded-lg w-full aspect-square object-contain bg-gray-700/50" />
                        </div>
                        <div>
                            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-1">Describe the new scene</label>
                            <textarea
                                id="prompt"
                                rows={4}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., A model wearing these shoes on a city street at night."
                                className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>
                         <button
                            onClick={handleGenerate}
                            disabled={isLoading || !prompt || !sourceImage}
                            className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Generating...' : 'Generate'}
                        </button>
                    </div>

                    <div className="flex flex-col items-center justify-center bg-gray-900/50 rounded-lg p-4 h-[450px]">
                        {isLoading && (
                             <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 border-4 border-t-teal-500 border-gray-600 rounded-full animate-spin"></div>
                                <p className="mt-4 text-white text-lg font-semibold">Creating your scene...</p>
                            </div>
                        )}
                        {!isLoading && resultImage && (
                            <div className="w-full h-full flex flex-col">
                                <p className="text-sm font-medium text-gray-300 mb-2 text-center">Generated Scene</p>
                                <img src={resultImage} alt="Generated variation" className="flex-grow rounded-lg w-full object-contain mb-4" />
                                <button
                                    onClick={handleDownload}
                                    className="w-full bg-green-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
                                >
                                    Download Image
                                </button>
                            </div>
                        )}
                        {!isLoading && !resultImage && (
                            <div className="text-center text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.636-6.364l.707-.707M17.657 17.657l.707.707M6.343 6.343l-.707-.707" /></svg>
                                <h3 className="mt-2 text-lg font-medium">Your new scene will appear here</h3>
                            </div>
                        )}
                        {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};