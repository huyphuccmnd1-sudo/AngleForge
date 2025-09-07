
import React from 'react';

interface LoadingOverlayProps {
    message: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="w-16 h-16 border-4 border-t-indigo-500 border-gray-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-white text-lg font-semibold">{message}</p>
        </div>
    );
};
