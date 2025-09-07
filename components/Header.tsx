import React from 'react';
import type { ActiveTab } from '../App';

interface HeaderProps {
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
}

const TabButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-300 ${
                isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
        >
            {label}
        </button>
    );
};

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-700">
        <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
                    </svg>
                 </div>
                <h1 className="text-2xl font-bold text-white">Angle<span className="text-indigo-400">Forge</span></h1>
            </div>
            <nav className="flex items-center gap-2 bg-gray-900/50 p-1 rounded-lg border border-gray-700">
                <TabButton label="Home" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                <TabButton label="Generator" isActive={activeTab === 'generator'} onClick={() => setActiveTab('generator')} />
            </nav>
        </div>
    </header>
);