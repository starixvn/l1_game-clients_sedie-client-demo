import { GameBaseComponent } from '../interfaces/common-types';

export class GameUIService {
    static resetBettingPanel(component: GameBaseComponent) {
        console.log('🔴 GameUIService: resetBettingPanel called');
        component.setState({
            activePanelId: null,
            showBetPanel: false,
        });
    }

    static handleBetOption(component: GameBaseComponent) {
        console.log('🔴 GameUIService: handleBetOption called');
        GameUIService.resetBettingPanel(component);
        component.setState({ isShowNextRoundMessage: true });
        setTimeout(() => {
            component.setState({ isShowNextRoundMessage: false });
        }, 3000);
    }

    static toggleStatistic(component: GameBaseComponent) {
        console.log('🔴 GameUIService: toggleStatistic called');
        component.setState({ isOpenStatistic: !component.state.isOpenStatistic });
    }

    static togglePopup(component: GameBaseComponent) {
        console.log('🔴 GameUIService: togglePopup called');
        component.setState({
            isPopupVisible: !component.state.isPopupVisible
        });
    }
} 