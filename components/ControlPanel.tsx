
import React from 'react';
import type { BackgroundMode } from '../types';

interface ControlPanelProps {
    numViews: number;
    setNumViews: (value: number) => void;
    backgroundMode: BackgroundMode;
    setBackgroundMode: (value: BackgroundMode) => void;
    extras: string;
    setExtras: (value: string) => void;
}

const backgroundOptions: { id: BackgroundMode; label: string }[] = [
    { id: 'white', label: 'White' },
    { id: 'transparent', label: 'Transparent' },
    { id: 'showroom', label: 'Showroom' },
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
    numViews,
    setNumViews,
    backgroundMode,
    setBackgroundMode,
    extras,
    setExtras,
}) => {
    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="numViews" className="block text-sm font-medium text-gray-300 mb-2">Number of Views: <span className="font-bold text-indigo-400">{numViews}</span></label>
                <input
                    id="numViews"
                    type="range"
                    min="4"
                    max="10"
                    value={numViews}
                    onChange={(e) => setNumViews(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Background Mode</label>
                <div className="grid grid-cols-3 gap-2">
                    {backgroundOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setBackgroundMode(option.id)}
                            className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                                backgroundMode === option.id
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="extras" className="block text-sm font-medium text-gray-300 mb-2">Optional Instructions</label>
                <input
                    id="extras"
                    type="text"
                    value={extras}
                    onChange={(e) => setExtras(e.target.value)}
                    placeholder="e.g., subtle contact shadow, 3000K warm light"
                    className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
            </div>
        </div>
    );
};
