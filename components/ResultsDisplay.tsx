import React from 'react';
import type { GeneratedImage } from '../types';

interface ResultsDisplayProps {
    generatedImages: GeneratedImage[];
    selectedImage: GeneratedImage | null;
    setSelectedImage: (image: GeneratedImage | null) => void;
    onRegenerate: (index: number) => void;
    onOpenVariationModal: (image: GeneratedImage) => void;
}

const ImageCard: React.FC<{
    image: GeneratedImage;
    isSelected: boolean;
    onClick: () => void;
}> = ({ image, isSelected, onClick }) => {
    return (
        <div
            className={`relative aspect-square bg-gray-700/50 rounded-lg overflow-hidden group border-2 cursor-pointer transition-all duration-200 ${isSelected ? 'border-indigo-500 scale-105' : 'border-gray-700 hover:border-gray-500'}`}
            onClick={onClick}
        >
            {image.src ? (
                <>
                    <img src={image.src} alt={image.name} className="w-full h-full object-contain" />
                    <div className="absolute top-1.5 left-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono select-none">AI</div>
                </>
            ) : (
                <div className="w-full h-full flex items-center justify-center animate-pulse">
                    <svg className="w-8 h-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-white font-semibold text-xs capitalize truncate">{image.angle.name.replace(/_/g, ' ')}</p>
            </div>
        </div>
    );
};

const PreviewPane: React.FC<{
    selectedImage: GeneratedImage | null;
    onOpenVariationModal: (image: GeneratedImage) => void;
}> = ({ selectedImage, onOpenVariationModal }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-900/50 rounded-lg border border-gray-700 p-4">
            {selectedImage ? (
                <div className="w-full h-full flex flex-col">
                    <div className="flex-grow flex items-center justify-center relative">
                     {selectedImage.src ? (
                        <>
                          <img src={selectedImage.src} alt={selectedImage.name} className="max-w-full max-h-full object-contain" />
                          <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono select-none">AI</div>
                        </>
                     ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="w-16 h-16 border-4 border-t-indigo-500 border-gray-600 rounded-full animate-spin"></div>
                        </div>
                     )}
                    </div>
                    <div className="mt-4 flex-shrink-0">
                        <button
                            onClick={() => onOpenVariationModal(selectedImage)}
                            disabled={!selectedImage.src}
                            className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 3a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V4a1 1 0 011-1z" />
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" />
                            </svg>
                            Create Scene
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 8.188a9 9 0 111.414 1.414L2 21l3-3 3.188-3.188z" />
                    </svg>
                    <p>Click a thumbnail to preview</p>
                </div>
            )}
        </div>
    );
};


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ generatedImages, selectedImage, setSelectedImage, onRegenerate, onOpenVariationModal }) => {
    if (generatedImages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed border-gray-600 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <h3 className="text-xl font-semibold text-gray-300">Your generated views will appear here.</h3>
                <p className="text-gray-500">Upload an image and configure your shot to get started.</p>
            </div>
        );
    }

    const handleSelect = (image: GeneratedImage, index: number) => {
        setSelectedImage(image);
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full min-h-[400px]">
            <div className="md:col-span-7 lg:col-span-8">
                <PreviewPane selectedImage={selectedImage} onOpenVariationModal={onOpenVariationModal} />
            </div>
            <div className="md:col-span-5 lg:col-span-4">
                 <div className="grid grid-cols-3 gap-2">
                    {generatedImages.map((image, index) => (
                        <ImageCard
                            key={image.name + index}
                            image={image}
                            isSelected={selectedImage === image}
                            onClick={() => handleSelect(image, index)}
                        />
                    ))}
                </div>
                 <div className="grid grid-cols-3 gap-2 mt-4">
                    {generatedImages.map((image, index) => (
                         <button 
                            key={`regen-${index}`}
                            onClick={() => onRegenerate(index)} 
                            title="Regenerate" 
                            className="p-2 w-full rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2 text-xs"
                         >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                               <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.99-1.691L12 12.5l-3.182-3.182" />
                            </svg>
                            Regen
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
