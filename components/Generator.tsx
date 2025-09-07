import React, { useState, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import { ImageUploader } from './ImageUploader';
import { ControlPanel } from './ControlPanel';
import { ResultsDisplay } from './ResultsDisplay';
import { LoadingOverlay } from './LoadingOverlay';
import { VariationModal } from './VariationModal';
import type { BackgroundMode, GeneratedImage, Angle } from '../types';
import { describeProduct, renderView, generateScene } from '../services/geminiService';
import { generateAngleList } from '../utils/anglePlanner';
import { fileToBase64 } from '../utils/fileUtils';

export const Generator: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [numViews, setNumViews] = useState<number>(6);
    const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('white');
    const [extras, setExtras] = useState<string>('');
    
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
    const [productProfile, setProductProfile] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    
    const [isVariationModalOpen, setIsVariationModalOpen] = useState(false);
    const [variationSourceImage, setVariationSourceImage] = useState<GeneratedImage | null>(null);

    useEffect(() => {
        if (generatedImages.length > 0 && !selectedImage) {
            const firstCompletedImage = generatedImages.find(img => img.src);
            if (firstCompletedImage) setSelectedImage(firstCompletedImage);
        } else if (generatedImages.length === 0) {
            setSelectedImage(null);
        }
    }, [generatedImages, selectedImage]);

    const handleImageChange = (file: File | null) => {
        setImageFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
            setGeneratedImages([]);
            setProductProfile(null);
            setError(null);
        }
    };

    const handleGenerate = useCallback(async () => {
        if (!imageFile) {
            setError('Please upload a product image first.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setSelectedImage(null);

        try {
            setLoadingMessage('Preparing image...');
            const imageBase64 = await fileToBase64(imageFile);
            const imageMimeType = imageFile.type;

            setLoadingMessage('Analyzing product identity...');
            const profile = await describeProduct(imageBase64, imageMimeType);
            setProductProfile(profile);

            setLoadingMessage('Planning camera angles...');
            const angleList = generateAngleList(numViews);

            const placeholderImages: GeneratedImage[] = angleList.map(angle => ({
                name: `${angle.name}.png`,
                src: null,
                angle: angle,
            }));
            setGeneratedImages(placeholderImages);
            
            setLoadingMessage(`Rendering ${angleList.length} views...`);

            const CONCURRENCY_LIMIT = 1;
            const indexedAngleList = angleList.map((angle, index) => ({ angle, originalIndex: index }));

            for (let i = 0; i < indexedAngleList.length; i += CONCURRENCY_LIMIT) {
                const chunk = indexedAngleList.slice(i, i + CONCURRENCY_LIMIT);
                const renderPromises = chunk.map(({ angle, originalIndex }) =>
                    renderView({
                        imageBase64,
                        imageMimeType,
                        productProfile: profile,
                        angle,
                        backgroundMode,
                        extras,
                    }).then(renderedImageBase64 => {
                        const newImage: GeneratedImage = {
                            name: `${angle.name}.png`,
                            src: `data:image/png;base64,${renderedImageBase64}`,
                            angle: angle,
                        };
                        setGeneratedImages(currentImages => {
                            const updatedImages = [...currentImages];
                            updatedImages[originalIndex] = newImage;
                            return updatedImages;
                        });
                    }).catch(err => {
                        console.error(`Failed to render view: ${angle.name}`, err);
                        throw err; 
                    })
                );
                await Promise.all(renderPromises);
            }

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
            if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
                 setError("Generation failed due to high server traffic. Please try generating fewer views or wait a moment before trying again.");
            } else {
                setError(err instanceof Error ? err.message : 'An unknown error occurred during generation.');
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [imageFile, numViews, backgroundMode, extras]);

    const handleRegenerate = useCallback(async (index: number) => {
        if (!imageFile || !productProfile || !generatedImages[index]) {
            setError('Cannot regenerate. Missing original image or product profile.');
            return;
        }

        const imageToRegen = generatedImages[index];
        const wasSelected = selectedImage === imageToRegen;
        const angle = imageToRegen.angle;

        const placeholderImage = { ...imageToRegen, src: null };
        setGeneratedImages(current => {
            const updated = [...current];
            updated[index] = placeholderImage;
            return updated;
        });
        if (wasSelected) {
            setSelectedImage(placeholderImage);
        }
        setError(null);

        try {
            const imageBase64 = await fileToBase64(imageFile);
            const renderedImageBase64 = await renderView({
                imageBase64,
                imageMimeType: imageFile.type,
                productProfile,
                angle,
                backgroundMode,
                extras,
            });
            const newImage: GeneratedImage = {
                name: `${angle.name}.png`,
                src: `data:image/png;base64,${renderedImageBase64}`,
                angle: angle,
            };
            setGeneratedImages(current => {
                const updated = [...current];
                updated[index] = newImage;
                return updated;
            });
            if (wasSelected) {
                setSelectedImage(newImage);
            }
        } catch (err) {
            console.error(`Failed to regenerate view: ${angle.name}`, err);
            setError(`Failed to regenerate ${angle.name}. Please try again.`);
            setGeneratedImages(current => {
                const updated = [...current];
                updated[index] = imageToRegen; // Restore old image
                return updated;
            });
            if (wasSelected) {
                setSelectedImage(imageToRegen);
            }
        }
    }, [imageFile, productProfile, generatedImages, backgroundMode, extras, selectedImage]);
    
    const handleDownloadAll = useCallback(async () => {
        const imagesToZip = generatedImages.filter(image => image.src);
        if (imagesToZip.length === 0) return;
        
        setLoadingMessage('Zipping files...');
        setIsLoading(true);

        const zip = new JSZip();
        imagesToZip.forEach(image => {
            if (image.src) {
                const base64Data = image.src.split(',')[1];
                zip.file(image.name, base64Data, { base64: true });
            }
        });

        try {
            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'AngleForge_export.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch(err) {
            setError('Failed to create zip file.');
            console.error(err);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [generatedImages]);

    const handleOpenVariationModal = (image: GeneratedImage) => {
        setVariationSourceImage(image);
        setIsVariationModalOpen(true);
    };

    return (
        <>
            {isLoading && <LoadingOverlay message={loadingMessage} />}
            <VariationModal
                isOpen={isVariationModalOpen}
                onClose={() => setIsVariationModalOpen(false)}
                sourceImage={variationSourceImage}
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                <div className="lg:col-span-4 bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700">
                    <h2 className="text-2xl font-bold mb-6 text-indigo-400">1. Configure Your Product Shot</h2>
                    <div className="space-y-6">
                        <ImageUploader imagePreview={imagePreview} onImageChange={handleImageChange} />
                        <ControlPanel
                            numViews={numViews}
                            setNumViews={setNumViews}
                            backgroundMode={backgroundMode}
                            setBackgroundMode={setBackgroundMode}
                            extras={extras}
                            setExtras={setExtras}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={!imageFile || isLoading}
                            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            {isLoading ? 'Generating...' : 'Forge Angles'}
                        </button>
                        {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                    </div>
                </div>

                <div className="lg:col-span-8 bg-gray-800/50 rounded-2xl p-6 shadow-2xl border border-gray-700">
                     <div className="flex justify-between items-center mb-6">
                         <h2 className="text-2xl font-bold text-indigo-400">2. Generated Views</h2>
                         <button
                            onClick={handleDownloadAll}
                            disabled={generatedImages.filter(img => img.src).length === 0 || isLoading}
                            className="bg-green-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 flex items-center gap-2"
                        >
                            Download All (.zip)
                        </button>
                     </div>
                    <ResultsDisplay 
                        generatedImages={generatedImages} 
                        selectedImage={selectedImage}
                        setSelectedImage={setSelectedImage}
                        onRegenerate={handleRegenerate} 
                        onOpenVariationModal={handleOpenVariationModal}
                    />
                </div>
            </div>
        </>
    );
};