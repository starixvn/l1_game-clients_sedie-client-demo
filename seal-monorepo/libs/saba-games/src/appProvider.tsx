import { ReactNode, createContext, useContext } from 'react';

export interface AppContextType {
    appEnv: string;
    language: string;
    siteId: string;
}

interface AppProviderProps extends AppContextType {
    children: ReactNode;
}

export const DEFAULT_APP_CONTEXT = {
    language: 'en',
    appEnv: '',
    siteId: ''
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
    const contextValue: AppContextType = { appEnv, language, siteId };

    return (
        <AppContextProvider value={contextValue}>
            {children}
        </AppContextProvider>
    );
};