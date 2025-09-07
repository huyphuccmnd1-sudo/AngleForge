
import React, { useRef } from 'react';

interface ImageUploaderProps {
    imagePreview: string | null;
    onImageChange: (file: File | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ imagePreview, onImageChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        onImageChange(file);
    };

    const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files?.[0] || null;
        onImageChange(file);
    };

    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleRemoveImage = () => {
        onImageChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Product Image</label>
            {imagePreview ? (
                <div className="relative">
                    <img src={imagePreview} alt="Product preview" className="w-full h-auto object-cover rounded-lg" />
                    <button 
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
                        aria-label="Remove image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ) : (
                <label 
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="flex justify-center w-full h-48 px-4 transition bg-gray-700 border-2 border-gray-600 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-500 focus:outline-none">
                    <span className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="font-medium text-gray-400">
                            Drop an image, or <span className="text-indigo-400 underline">browse</span>
                        </span>
                    </span>
                    <input type="file" name="file_upload" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} ref={fileInputRef} />
                </label>
            )}
        </div>
    );
};
