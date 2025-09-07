import React, { useState } from 'react';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { Generator } from './components/Generator';

export type ActiveTab = 'home' | 'generator';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('home');

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="container mx-auto p-4 md:p-8">
                {activeTab === 'home' && <Home setActiveTab={setActiveTab} />}
                {activeTab === 'generator' && <Generator />}
            </main>
        </div>
    );
};

export default App;