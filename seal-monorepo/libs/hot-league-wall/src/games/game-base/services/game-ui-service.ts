import { GameBaseComponent } from '../interfaces/common-types';

export class GameUIService {
    static resetBettingPanel(component: GameBaseComponent) {
        component.setState({
            activePanelId: null,
            showBetPanel: false,
        });
    }

    static handleBetOption(component: GameBaseComponent) {
        GameUIService.resetBettingPanel(component);
        component.setState({ isShowNextRoundMessage: true });
        setTimeout(() => {
            component.setState({ isShowNextRoundMessage: false });
        }, 3000);
    }

    static toggleStatistic(component: GameBaseComponent) {
        component.setState({ isOpenStatistic: !component.state.isOpenStatistic });
    }

    static togglePopup(component: GameBaseComponent) {
        component.setState({
            isPopupVisible: !component.state.isPopupVisible
        });
    }
} 