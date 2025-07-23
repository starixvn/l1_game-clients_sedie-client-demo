import { Suspense } from 'react';
import { IRNGSoccerPageState } from './rng-soccer-state-manager';
import { GameBaseProps } from '../../../../games/game-base/type';
import { GameBettingOptionsContext } from '../../../../_shared/react-contexts/game-betting-zone-context/game-betting-zone-context';
import styles from '../rng-soccer.module.scss';
import { setting } from '../game-settings';
import RNGSoccerBetOptions from '../bet-option/rng-soccer-bet-options';
import RNGSoccerSettlementResult from '../settlement-result/rng-soccer-settlement-result';
import RNGSoccerStatistic from '../statistic/rng-soccer-statistic';

export class RNGSoccerRenderers {
    private props: GameBaseProps;
    private state: IRNGSoccerPageState;
    private setState: (state: Partial<IRNGSoccerPageState>) => void;
    private togglePopup: () => void;
    private setShowBetPanel: (show: boolean) => void;
    private setPanelId: (id: string) => void;
    private resetBettingPanel: () => void;

    constructor(
        props: GameBaseProps,
        state: IRNGSoccerPageState,
        setState: (state: Partial<IRNGSoccerPageState>) => void,
        togglePopup: () => void,
        setShowBetPanel: (show: boolean) => void,
        setPanelId: (id: string) => void,
        resetBettingPanel: () => void
    ) {
        this.props = props;
        this.state = state;
        this.setState = setState;
        this.togglePopup = togglePopup;
        this.setShowBetPanel = setShowBetPanel;
        this.setPanelId = setPanelId;
        this.resetBettingPanel = resetBettingPanel;
    }

    renderCustomContent(): JSX.Element {
        return (
            <Suspense fallback={<div>Loading...</div>}>
                <RNGSoccerSettlementResult
                    namespace={setting.mainObserverNamespace}
                    language={this.props.language}
                />
            </Suspense>
        );
    }

    renderCustomFooter(): JSX.Element {
        return (
            <div className={styles['wrapper-sport-bottom']}>
                {this.renderCustomBetting()}
            </div>
        );
    }

    renderCustomBetting(): JSX.Element {
        return (
            <GameBettingOptionsContext.Provider
                value={{
                    panelId: this.state.activePanelId,
                    setPanelId: this.setPanelId,
                    show: this.state.showBetPanel,
                    setShow: this.setShowBetPanel,
                }}
            >
                <RNGSoccerBetOptions
                    gameName={setting.gameName}
                    namespace={setting.mainObserverNamespace}
                    language={this.props.language}
                    onBet={() => {
                        this.resetBettingPanel();
                        this.setState({ isShowNextRoundMessage: true } as Pick<IRNGSoccerPageState, keyof IRNGSoccerPageState>);
                        setTimeout(() => {
                            this.setState({ isShowNextRoundMessage: false } as Pick<IRNGSoccerPageState, keyof IRNGSoccerPageState>);
                        }, 3000);
                    }}
                />
            </GameBettingOptionsContext.Provider>
        );
    }

    renderCustomHistory(state: IRNGSoccerPageState): JSX.Element {
        return (
            <Suspense fallback={<div>Loading...</div>}>
                <RNGSoccerStatistic
                    namespace={this.props.namespace}
                    language={this.props.language}
                    isPopupVisible={state.isPopupVisible ?? false}
                    togglePopup={this.togglePopup}
                />
            </Suspense>
        );
    }
} 