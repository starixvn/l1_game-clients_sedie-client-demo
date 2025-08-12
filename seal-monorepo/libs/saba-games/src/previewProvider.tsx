import { ReactNode, createContext, useState, useContext } from 'react';

export interface PreviewContextType {
    theme: string;
    isDarkMode: boolean;
    setTheme: (theme: string) => void;
    setIsDarkMode: (isDarkMode: boolean) => void;
    language: string;
    setLanguage: (language: string) => void;
}

interface PreviewProviderProps {
    children: ReactNode;
}

export const DEFAULT_PREVIEW_CONTEXT = {
    theme: 'default',
    isDarkMode: false,
    language: 'en'
};

// Create the context
export const PreviewContext = createContext<PreviewContextType>({
    ...DEFAULT_PREVIEW_CONTEXT,
    setTheme: () => { },
    setIsDarkMode: () => { },
    setLanguage: () => { }
});

// Set display name for dev tools
PreviewContext.displayName = 'PreviewContext';

// Export Provider and Consumer for render props pattern
export const PreviewContextProvider = PreviewContext.Provider;
export const PreviewContextConsumer = PreviewContext.Consumer;

// Hook for functional components
export const usePreviewContext = () => useContext(PreviewContext);

export const PreviewProvider: React.FC<PreviewProviderProps> = ({
    children
}: PreviewProviderProps) => {
    const [theme, setTheme] = useState(DEFAULT_PREVIEW_CONTEXT.theme);
    const [isDarkMode, setIsDarkMode] = useState(DEFAULT_PREVIEW_CONTEXT.isDarkMode);
    const [language, setLanguage] = useState('en');

    const contextValue: PreviewContextType = {
        theme,
        isDarkMode,
        setTheme,
        setIsDarkMode,
        language,
        setLanguage,
    };

    return (
        <PreviewContextProvider value={contextValue}>
            {children}
        </PreviewContextProvider>
    );
};