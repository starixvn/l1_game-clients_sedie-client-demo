import { GameBaseProps } from '../../../../games/game-base/type';
import { RNGSoccerStateManager, IRNGSoccerPageState } from './rng-soccer-state-manager';
import { RNGSoccerUIConfig } from './rng-soccer-ui-config';
import { RNGSoccerRenderers } from './rng-soccer-renderers';

export default class RNGSoccerOrchestrator {
    private stateManager: RNGSoccerStateManager;
    private uiConfig: RNGSoccerUIConfig;
    private renderers: RNGSoccerRenderers;
    private state: IRNGSoccerPageState;
    private props: GameBaseProps;

    constructor(props: GameBaseProps) {
        this.props = props;

        // Initialize state manager
        this.stateManager = new RNGSoccerStateManager(props);
        this.state = this.stateManager.getState();


        // Initialize renderers
        this.renderers = new RNGSoccerRenderers(
            props,
            this.state,
            this.setState.bind(this),
            this.togglePopup.bind(this),
            this.setShowBetPanel.bind(this),
            this.setPanelId.bind(this),
            this.resetBettingPanel.bind(this)
        );

        // Initialize UI config
        this.uiConfig = new RNGSoccerUIConfig(
            this.togglePopup.bind(this),
            this.renderers.renderCustomContent.bind(this.renderers),
            this.renderers.renderCustomFooter.bind(this.renderers),
            this.renderers.renderCustomHistory.bind(this.renderers),
            this.renderers.renderCustomBetting.bind(this.renderers)
        );
    }

    // State management methods - delegate to state manager
    togglePopup = () => {
        this.stateManager.togglePopup(this.setState.bind(this));
    }

    setShowBetPanel = (show: boolean) => {
        this.stateManager.setShowBetPanel(show, this.setState.bind(this));
    };

    setPanelId = (id: string) => {
        this.stateManager.setPanelId(id, this.setState.bind(this));
    };

    resetBettingPanel = () => {
        this.stateManager.resetBettingPanel(this.setState.bind(this));
    };

    getGameBackgroundImage(): string {
        return this.uiConfig.getGameBackgroundImage();
    }

    getDisconnectViewBackground(): string {
        return this.uiConfig.getDisconnectViewBackground();
    }

    // State management
    setState(newState: Partial<IRNGSoccerPageState>) {
        this.state = { ...this.state, ...newState };
        this.updateComponents();
    }

    getState(): IRNGSoccerPageState {
        return this.state;
    }

    // Update components when state changes
    private updateComponents() {
        this.renderers = new RNGSoccerRenderers(
            this.props,
            this.state,
            this.setState.bind(this),
            this.togglePopup.bind(this),
            this.setShowBetPanel.bind(this),
            this.setPanelId.bind(this),
            this.resetBettingPanel.bind(this)
        );

        this.uiConfig = new RNGSoccerUIConfig(
            this.togglePopup.bind(this),
            this.renderers.renderCustomContent.bind(this.renderers),
            this.renderers.renderCustomFooter.bind(this.renderers),
            this.renderers.renderCustomHistory.bind(this.renderers),
            this.renderers.renderCustomBetting.bind(this.renderers)
        );
    }

    // Public methods to access components
    getRenderers(): RNGSoccerRenderers {
        return this.renderers;
    }

    getUIConfig(): RNGSoccerUIConfig {
        return this.uiConfig;
    }
} 