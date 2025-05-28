import { ReactNode, createContext, useContext, useState, useEffect } from 'react';

export interface AppContextType {
    appEnv: string;
    language: string;
    siteId: string;
    theme: string;
    isDarkMode: boolean;
}

interface AppProviderProps {
    children: ReactNode;
    appEnv: string;
    language: string;
    siteId: string;
}

export const DEFAULT_APP_CONTEXT = {
    language: 'en',
    appEnv: '',
    siteId: '',
    theme: 'light-01',
    isDarkMode: false
};

// Create the context
export const AppContext = createContext<AppContextType>({
    ...DEFAULT_APP_CONTEXT
});

// Set display name for dev tools
AppContext.displayName = 'AppContext';

// Export Provider and Consumer for render props pattern
export const AppContextProvider = AppContext.Provider;
export const AppContextConsumer = AppContext.Consumer;

// Hook for functional components
export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<AppProviderProps> = ({
    children,
    appEnv,
    language,
    siteId
}: AppProviderProps) => {
    const [contextValue, setContextValue] = useState<AppContextType>({
        appEnv,
        language,
        siteId,
        theme: 'light-01',
        isDarkMode: false
    });

    // Listen for UPDATE_SETTINGS messages
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'UPDATE_SETTINGS') {
                console.log('AppProvider received UPDATE_SETTINGS:', event.data);
                const { theme, isDarkMode, language } = event.data.settings;

                setContextValue(prev => ({
                    ...prev,
                    theme: theme || 'light-01',
                    isDarkMode,
                    language: language || 'en'
                }));
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <AppContextProvider value={contextValue}>
            {children}
        </AppContextProvider>
    );
};