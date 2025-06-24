import { UIExtensionOptions } from '../../../../games/game-base/ui/game-ui-renderer';
import { IRNGSoccerPageState } from './rng-soccer-state-manager';
import styles from '../rng-soccer.module.scss';
import liveIcon from '../../../assets/rng-soccer/live-icon.svg';
import historyBtnIcon from '../../../assets/rng-soccer/history-btn.svg';
import bgGame from '../../../assets/rng-soccer/bg-game.webp';
import blurBgGame from '../../../assets/rng-soccer/blur-bg-game.png';

export class RNGSoccerUIConfig {
    private togglePopup: () => void;
    private renderCustomContent: () => JSX.Element;
    private renderCustomFooter: () => JSX.Element;
    private renderCustomHistory: (state: IRNGSoccerPageState) => JSX.Element;
    private renderCustomBetting: () => JSX.Element;

    constructor(
        togglePopup: () => void,
        renderCustomContent: () => JSX.Element,
        renderCustomFooter: () => JSX.Element,
        renderCustomHistory: (state: IRNGSoccerPageState) => JSX.Element,
        renderCustomBetting: () => JSX.Element
    ) {
        this.togglePopup = togglePopup;
        this.renderCustomContent = renderCustomContent;
        this.renderCustomFooter = renderCustomFooter;
        this.renderCustomHistory = renderCustomHistory;
        this.renderCustomBetting = renderCustomBetting;
    }

    getUIExtensionOptions(): UIExtensionOptions {
        console.log('🔵 RNGSoccerUIConfig: getUIExtensionOptions called');
        return {
            classes: {
                gameContainer: styles['sport-item'],
                header: styles['wrapper-sport-top'],
                content: styles['wrapper-sport-content'],
                footer: styles['wrapper-sport-bottom'],
                popup: styles['statistic-popup'],
                gameNameText: styles['game-name-text'],
                gameNameRound: styles['game-name-round'],
                liveIcon: styles['live-icon'],
                timer: styles['timer'],
                statsIcon: styles['score-board-img']
            },
            components: {
                customContent: () => this.renderCustomContent(),
                customFooter: () => this.renderCustomFooter(),
                customHistory: (props, state) => this.renderCustomHistory(state as IRNGSoccerPageState),
                customBetting: () => this.renderCustomBetting()
            },
            config: {
                gameName: 'RNGSoccer',
                liveIconUrl: liveIcon,
                statsIconUrl: historyBtnIcon,
                onStatsIconClick: this.togglePopup
            }
        };
    }

    getGameBackgroundImage(): string {
        console.log('🔵 RNGSoccerUIConfig: getGameBackgroundImage called, returning:', bgGame);
        return bgGame;
    }

    getDisconnectViewBackground(): string {
        console.log('🔵 RNGSoccerUIConfig: getDisconnectViewBackground called, returning:', blurBgGame);
        return blurBgGame;
    }
} 