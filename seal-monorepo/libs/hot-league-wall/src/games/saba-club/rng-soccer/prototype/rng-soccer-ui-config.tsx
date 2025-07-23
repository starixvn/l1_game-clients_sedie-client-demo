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
        renderCustomBetting: () => JSX.Element,
    ) {
        this.togglePopup = togglePopup;
        this.renderCustomContent = renderCustomContent;
        this.renderCustomFooter = renderCustomFooter;
        this.renderCustomHistory = renderCustomHistory;
        this.renderCustomBetting = renderCustomBetting;
    }

    getGameBackgroundImage(): string {
        return bgGame;
    }

    getDisconnectViewBackground(): string {
        return blurBgGame;
    }
}
