import React from 'react';
import type { Preview } from '@storybook/react';
import gc, { translations } from './mocks/game-client';

if (typeof window !== 'undefined') {
    (window as any).gc = gc;
}

// Create a wrapper component for language switching
const LanguageWrapper = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = React.useState('en');

    // Update translator when language changes
    React.useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).gc) {
            (window as any).gc.Translator.translate = (key: string) => {
                return translations[language][key] || key;
            };
        }
    }, [language]);

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{ padding: '5px', marginRight: '10px' }}
                >
                    <option value="en">English</option>
                    <option value="zh_cn">简体中文</option>
                    <option value="zh_tw">繁體中文</option>
                </select>
            </div>
            {children}
        </div>
    );
};

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: "^on[A-Z].*" },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
    },
    decorators: [
        (Story) => (
            <LanguageWrapper>
                <Story />
            </LanguageWrapper>
        ),
    ],
};

export default preview;
