
import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ControlPanel } from './components/ControlPanel';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingOverlay } from './components/LoadingOverlay';
import type { BackgroundMode, GeneratedImage, Angle } from './types';
import { describeProduct, renderView } from './services/geminiService';
import { generateAngleList } from './utils/anglePlanner';
import { fileToBase64 } from './utils/fileUtils';

const App: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [numViews, setNumViews] = useState<number>(6);
    const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('white');
    const [extras, setExtras] = useState<string>('');
    
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [productProfile, setProductProfile] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

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

            const renderPromises = angleList.map((angle, index) =>
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
                        updatedImages[index] = newImage;
                        return updatedImages;
                    });
                }).catch(err => {
                    console.error(`Failed to render view: ${angle.name}`, err);
                    throw err; 
                })
            );

            await Promise.all(renderPromises);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred during generation.');
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
        const originalSrc = imageToRegen.src; // Keep old src in case of failure
        const angle = imageToRegen.angle;

        setGeneratedImages(current => {
            const updated = [...current];
            updated[index] = { ...updated[index], src: null };
            return updated;
        });
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
        } catch (err) {
            console.error(`Failed to regenerate view: ${angle.name}`, err);
            setError(`Failed to regenerate ${angle.name}. Please try again.`);
            // Restore the old image on failure
            setGeneratedImages(current => {
                const updated = [...current];
                updated[index] = { ...updated[index], src: originalSrc };
                return updated;
            });
        }
    }, [imageFile, productProfile, generatedImages, backgroundMode, extras]);
    
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
            // FIX: Correctly call URL.createObjectURL to generate a URL for the blob.
            link.href = URL.createObjectURL(content);
            link.download = 'AngleForge_export.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch(err) {
            setError('Failed to create zip file.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [generatedImages]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            {isLoading && <LoadingOverlay message={loadingMessage} />}
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                        <ResultsDisplay generatedImages={generatedImages} onRegenerate={handleRegenerate} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
