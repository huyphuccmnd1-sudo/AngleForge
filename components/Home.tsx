import React from 'react';
import type { ActiveTab } from '../App';

interface HomeProps {
    setActiveTab: (tab: ActiveTab) => void;
}

const FeatureCard: React.FC<{ icon: JSX.Element; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 h-full">
        <div className="flex items-center gap-4 mb-3">
            <div className="w-10 h-10 bg-indigo-600/20 text-indigo-400 rounded-lg flex items-center justify-center flex-shrink-0">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-gray-400">{children}</p>
    </div>
);

export const Home: React.FC<HomeProps> = ({ setActiveTab }) => {
    return (
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                Instantly Generate Any Product Angle
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                AngleForge uses the power of Google's <span className="font-bold text-indigo-400">Nano Banana</span> model to create a full 360° view of your product from a single image. Save time, cut costs, and sell more.
            </p>
            <button
                onClick={() => setActiveTab('generator')}
                className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105 shadow-lg mb-16"
            >
                Start Forging
            </button>

            <div className="grid md:grid-cols-2 gap-8 text-left">
                <FeatureCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}
                    title="Save on Photoshoots"
                >
                    Eliminate the need for expensive and time-consuming product photography sessions. One high-quality photo is all you need to generate a complete set of e-commerce ready images, drastically reducing your production costs.
                </FeatureCard>
                <FeatureCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                    title="Enhance Customer Visualization"
                >
                    Give your customers the confidence to purchase by showing them every angle. A comprehensive view of the product helps shoppers make informed decisions, leading to higher conversion rates and fewer returns.
                </FeatureCard>
                <div className="md:col-span-2">
                    <FeatureCard 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                        title="Go Beyond Angles: Create Scenes"
                    >
                        Take any generated view and place your product into a completely new environment. Describe a scene, add a model, or create a lifestyle shot with a simple text prompt to tell your product's story.
                    </FeatureCard>
                </div>
            </div>
            
            <div className="mt-12 text-center text-sm text-gray-500">
                Powered by <code className="bg-gray-700/50 text-indigo-400 rounded px-1 py-0.5">gemini-2.5-flash-image-preview</code>
            </div>
        </div>
    );
};
