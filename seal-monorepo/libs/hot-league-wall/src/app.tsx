import './styles/main.scss';
import './_shared/utils/string-helper';
import { loadI18n } from './i18n';
import Lobby from './lobby/lobby';
import { AppProvider, useAppContext } from './appProvider';
import { SyncMemberSiteBalance } from './_shared/utils/sync-member-site-balance';
import { useEffect, useState, useCallback } from 'react';
import IframeContainer from './components/IframeContainer';
import { BetPanelState } from './components/BetPanel';

interface AppProps extends AppContentProps {
    appEnv: string;
    siteId: string;
    language: string;
    renewToken?: Function;
    updateBalanceCallback?: void | null;
}

interface AppContentProps {
    token: string;
    renewToken?: Function;
    updateBalanceCallback?: void | null;
}

const App = ({ appEnv, token, language, siteId, renewToken, updateBalanceCallback }: AppProps) => {
    return (
        <AppProvider appEnv={appEnv} language={language} siteId={siteId}>
            <AppContent token={token} renewToken={renewToken} updateBalanceCallback={updateBalanceCallback} />
        </AppProvider>
    );
};

const AppContent = ({ token, renewToken, updateBalanceCallback }: AppContentProps) => {
    const { language } = useAppContext();
    const [betPanelState, setBetPanelState] = useState<BetPanelState | null>(null);
    const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);

    const handleMessage = useCallback((data: any) => {
        console.log('Parent: Received message from iframe:', data);

        switch (data.type) {
            case 'BETTING_BLOCK_STATE':
                const { isShowBetSlip, betChoice, odd, position } = data.state;
                if (isShowBetSlip) {
                    setBetPanelState({
                        betChoice,
                        odd,
                        top: position?.top || 0,
                        left: position?.left || 0,
                        amount: 0,
                        currency: '',
                        min: 0,
                        max: 0,
                        payout: '0.00',
                        gameName: '',
                        namespace: '',
                        clientRoundId: 0,
                        isSpecialChoice: false,
                        warnMsg: ''
                    });
                    setIsPanelVisible(true);
                } else {
                    setIsPanelVisible(false);
                    setBetPanelState(null);
                }
                break;

            case 'BET_PANEL_STATE':
                setBetPanelState(data.state);
                setIsPanelVisible(true);
                break;

            case 'HIDE_BET_PANEL':
            case 'HIDE_ALL_BET_PANELS':
                setIsPanelVisible(false);
                setBetPanelState(null);
                break;
        }
    }, []);

    const handlePanelClose = useCallback(() => {
        setIsPanelVisible(false);
        setBetPanelState(null);
    }, []);

    useEffect(() => {
        if (updateBalanceCallback) {
            SyncMemberSiteBalance.getInstance().setSyncBalanceCallback(updateBalanceCallback);
        }
    }, [updateBalanceCallback]);

    loadI18n(language);
    return (
        <>
            <IframeContainer
                src="http://localhost:4200"
                onMessage={handleMessage}
                betPanelState={betPanelState}
                isPanelVisible={isPanelVisible}
                onPanelClose={handlePanelClose}
            />
            <div data-react="true" style={{ width: '100%' }}>
                {token && <Lobby token={token} language={language} renewToken={renewToken} />}
            </div>
        </>
    );
};

export default App;
