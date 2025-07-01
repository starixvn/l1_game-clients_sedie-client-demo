import { useSSOSimulator } from '../_shared/components/sso-control-simulator';

export type TokenRequestContext = 'FIRST_SSO' | 'SSO_RETRY';

export interface PrototypeState {
    playButtonClickCount: number;
    setPlayButtonClickCount: React.Dispatch<React.SetStateAction<number>>;
}

export interface PreviewContextProps {
    onRequestSSOToken: () => Promise<string | null>;
    playButtonClickCount: number;
    setPlayButtonClickCount: React.Dispatch<React.SetStateAction<number>>;
    currentScenarioKey: string;
    setCurrentScenarioKey: React.Dispatch<React.SetStateAction<string>>;
    ssoSimulator: ReturnType<typeof useSSOSimulator>;
}

export interface ScenarioResetWrapperProps {
    scenarioKey: string;
    children: (key: string) => React.ReactNode;
}

export interface SSOFailureModeLogicProps {
    showSSOControls: boolean;
    ssoSimulator: ReturnType<typeof useSSOSimulator>;
    playButtonClickCount: number;
}

export interface TokenRequestHookParams {
    playButtonClickCount: number;
    setPlayButtonClickCount: React.Dispatch<React.SetStateAction<number>>;
    failCount: number;
    isFailureMode: boolean;
}

export interface AppConfiguration {
    theme: string;
    isDarkMode: boolean;
    language: string;
    showSSOControls: boolean;
    appEnv: string;
    siteId: string;
    platform: string;
} 