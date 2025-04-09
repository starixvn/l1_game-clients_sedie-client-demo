import * as gc from '@sg/sg-game-client';
import { handle, observer, render } from '@sg/sg-observer';
import React from 'react';
import { configSharedContainer, sharedContainer } from '../_shared/components/game-base/startup';
import { LobbyStore } from '../_shared/states/lobby';
import * as lobbyUtils from './utils';
import styles from './lobby.module.scss';
import { DropdownType, LeagueTabDropdown } from '../_shared/components/all-tab-components/league-tab-dropdown';
import { AppContextConsumer } from '../appProvider';
import Loading from '../_shared/components/loading';
import { GameMatchTab } from '../_shared/components/all-tab-components/game-match-tab';
import { IOfferGame, ILobbyState } from './type';
import { GameListTab } from '../_shared/components/all-tab-components/game-list-tab';
import SessionTimeout from '../_shared/components/timeout';
import { reaction, autorun } from 'mobx';

// Direct access to monitor MainPlayerStore changes
(function patchMainPlayerStore() {
    try {
        const originalStore = gc.Player.MainPlayerStore;
        if (originalStore) {
            console.log('[SabaGames-Patch] Attempting to patch MainPlayerStore');
            const originalSetOfferGames = originalStore.prototype.setOfferGames;
            if (originalSetOfferGames) {
                originalStore.prototype.setOfferGames = function (...args) {
                    console.log('[SabaGames-Patch] setOfferGames intercepted:', args[0]);
                    const result = originalSetOfferGames.apply(this, args);
                    console.log('[SabaGames-Patch] setOfferGames completed');
                    return result;
                };
                console.log('[SabaGames-Patch] Successfully patched setOfferGames method');
            } else {
                console.log('[SabaGames-Patch] Could not find setOfferGames method to patch');
            }
        } else {
            console.log('[SabaGames-Patch] MainPlayerStore not found for patching');
        }
    } catch (error) {
        console.error('[SabaGames-Patch] Error patching MainPlayerStore:', error);
    }
})();

@observer
class LobbyComponent extends React.PureComponent<any, ILobbyState> {
    private reRenderGameTimeout?: NodeJS.Timeout;
    private offerGamesCheckInterval?: NodeJS.Timeout;
    private lastOfferGames: any = null;

    constructor(props: { token: string }) {
        super(props);
        console.log('[LobbyComponent] Constructor called with props:', props);
        configSharedContainer();
        this.state = {
            offerGames: [],
            isRenderGame: true,
            leagueToogle: true,
            expandedGames: {},
            selectedGameId: null,
            isSessionTimeout: false,
            isAuthenticated: false,
            username: '',
        };
        console.log('[LobbyComponent] Initial state:', this.state);
    }
    clearReRenderGameTimeout = () => {
        if (!this.reRenderGameTimeout) {
            return;
        }
        console.log('[LobbyComponent] Clearing reRenderGameTimeout');
        clearTimeout(this.reRenderGameTimeout);
    };

    componentWillUnmount() {
        console.log('[LobbyComponent] Component will unmount');
        this.clearReRenderGameTimeout();

        if (this.offerGamesCheckInterval) {
            clearInterval(this.offerGamesCheckInterval);
            this.offerGamesCheckInterval = undefined;
        }
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<ILobbyState>, snapshot?: any): void {
        console.log('[LobbyComponent] Component did update', {
            prevProps,
            prevState,
            currentProps: this.props,
            currentState: this.state
        });

        if (prevProps.token !== this.props.token) {
            console.log('[LobbyComponent] Token changed, calling sso with new token');
            this.sso({ token: this.props.token });
        }
    }

    componentDidMount() {
        console.log('[LobbyComponent] Component did mount');
        const { token } = this.props;
        console.log('[LobbyComponent] Calling sso with token:', token);

        // Check initial state values
        console.log('[LobbyComponent-Debug] Initial state in componentDidMount:', {
            offerGamesLength: this.state.offerGames.length,
            isAuthenticated: this.state.isAuthenticated,
            isSessionTimeout: this.state.isSessionTimeout
        });

        // Add direct subscription to AuthStore (since @render decorator isn't working)
        try {
            const authStore = sharedContainer.get(gc.Auth.AuthStore);
            if (authStore) {
                console.log('[LobbyComponent-Debug] Found AuthStore, setting up reaction for isAuthenticated');

                // Set up an immediate reaction to isAuthenticated changes
                reaction(
                    () => authStore.isAuthenticated,
                    (isAuthenticated) => {
                        console.log('[LobbyComponent-Debug] AuthStore.isAuthenticated changed to:', isAuthenticated);
                        this.handleIsAuthenticated(isAuthenticated);
                    },
                    { fireImmediately: true }
                );

                // Also manually check and trigger if needed
                if (authStore.isAuthenticated) {
                    console.log('[LobbyComponent-Debug] AuthStore is already authenticated, manually triggering handler');
                    this.handleIsAuthenticated(true);
                }
            } else {
                console.log('[LobbyComponent-Debug] AuthStore not found in container');
            }
        } catch (error) {
            console.error('[LobbyComponent-Debug] Error setting up AuthStore reaction:', error);
        }

        // Debug MainPlayerStore
        try {
            const mainPlayerStore = gc.Player.MainPlayerStore;
            console.log('[LobbyComponent-SabaGames] MainPlayerStore:', {
                storeExists: !!mainPlayerStore,
                offerGamesExists: mainPlayerStore && 'offerGames' in mainPlayerStore,
                // Access using safer method to avoid TypeScript errors
                storeType: typeof mainPlayerStore,
                storeToString: mainPlayerStore ? mainPlayerStore.toString() : 'null'
            });

            // Set up polling interval to check for offer games changes
            this.offerGamesCheckInterval = setInterval(this.checkMainPlayerStore, 1000);
            console.log('[LobbyComponent-SabaGames] Set up offer games polling interval');

            // Add autorun as an alternative to reaction
            autorun(() => {
                try {
                    if (sharedContainer) {
                        const storeInstance = sharedContainer.get(gc.Player.MainPlayerStore);
                        if (storeInstance && storeInstance.offerGames) {
                            console.log('[LobbyComponent-SabaGames] Autorun detected offerGames:', storeInstance.offerGames);
                            this.handleOfferGames(storeInstance.offerGames as IOfferGame[]);
                        }
                    }
                } catch (error) {
                    console.error('[LobbyComponent-SabaGames] Error in autorun:', error);
                }
            });

        } catch (error) {
            console.error('[LobbyComponent-SabaGames] Error accessing MainPlayerStore:', error);
        }

        this.sso({ token });

        // Force a manual check for authentication and offer games after a delay
        setTimeout(() => {
            console.log('[LobbyComponent-Debug] Performing delayed state check');
            this.checkMainPlayerStore();

            // Check if we need to force authentication state
            try {
                const authStore = sharedContainer.get(gc.Auth.AuthStore);
                if (authStore) {
                    console.log('[LobbyComponent-Debug] AuthStore found, checking isAuthenticated:',
                        authStore.isAuthenticated);

                    if (authStore.isAuthenticated && !this.state.isAuthenticated) {
                        console.log('[LobbyComponent-Debug] Forcing isAuthenticated state update');
                        this.setState({ isAuthenticated: true });
                    }
                }
            } catch (error) {
                console.error('[LobbyComponent-Debug] Error checking AuthStore:', error);
            }
        }, 2000);
    }

    @handle(gc.Auth.AuthHandlers.SSO)
    sso(ssoInfo: gc.Auth.ISSOInfo) {
        console.log('[LobbyComponent] SSO handler called with info:', ssoInfo);

        // Add a delayed authentication check after SSO
        setTimeout(() => {
            console.log('[LobbyComponent-Debug] Performing post-SSO auth check');
            try {
                const authStore = sharedContainer.get(gc.Auth.AuthStore);
                if (authStore) {
                    console.log('[LobbyComponent-Debug] AuthStore found after SSO, isAuthenticated:',
                        authStore.isAuthenticated);

                    if (authStore.isAuthenticated && !this.state.isAuthenticated) {
                        console.log('[LobbyComponent-Debug] Force triggering handleIsAuthenticated after SSO');
                        this.handleIsAuthenticated(true);
                    }
                }

                // Also check connected state
                if (this.state.isAuthenticated) {
                    console.log('[LobbyComponent-Debug] State already authenticated, checking connection');
                    this.connectLiveGateway();
                }
            } catch (error) {
                console.error('[LobbyComponent-Debug] Error in post-SSO check:', error);
            }
        }, 500);

        return ssoInfo;
    }

    @render(gc.App.AppStore, (store) => store.isSessionTimeout)
    redirectToSessionTimeoutPage(isSessionTimeout: boolean) {
        console.log('[LobbyComponent] Session timeout state changed:', isSessionTimeout);
        this.setState({ isSessionTimeout });
    }

    @render(gc.Auth.AuthStore, (store) => store.isAuthenticated)
    handleIsAuthenticated(isAuthenticated: boolean) {
        console.log('[LobbyComponent] Authentication state changed:', isAuthenticated);
        console.log('[LobbyComponent-Debug] handleIsAuthenticated method called with:', isAuthenticated);

        this.setState({ isAuthenticated });

        if (isAuthenticated) {
            console.log('[LobbyComponent] User is authenticated, connecting to live gateway');
            this.connectLiveGateway();

            // Additional actions when authenticated
            console.log('[LobbyComponent-Debug] Triggering manual check of MainPlayerStore after authentication');
            this.checkMainPlayerStore();

            // Force a refresh of state if needed
            setTimeout(() => {
                if (this.state.offerGames.length === 0) {
                    console.log('[LobbyComponent-Debug] No games after authentication, forcing update');
                    this.forceUpdate();
                }
            }, 1000);
        }
    }

    @handle(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler)
    connectLiveGateway() {
        console.log('[LobbyComponent] Connecting to live gateway');

        // Try to manually initiate connection if handler isn't working
        try {
            const connectionHandler = sharedContainer.get(gc.GatewayConnection.GatewayConnectionHandlers.ConnectHandler);
            if (connectionHandler && typeof connectionHandler.handle === 'function') {
                console.log('[LobbyComponent-Debug] Manually triggering gateway connection handler');
                connectionHandler.handle();
            } else {
                console.log('[LobbyComponent-Debug] Could not find or use ConnectHandler');

                // Try to trigger connection via any available means
                console.log('[LobbyComponent-Debug] Attempting alternative connection methods');

                // Last resort, try direct container access
                const allRegistrations = (sharedContainer as any)._registry?._registrations;
                if (allRegistrations) {
                    console.log('[LobbyComponent-Debug] Looking for connection-related services in container');

                    // Just log what's available for debugging
                    Object.keys(allRegistrations).forEach(key => {
                        if (key.toLowerCase().includes('connect') || key.toLowerCase().includes('gateway')) {
                            console.log('[LobbyComponent-Debug] Found potential connection service:', key);
                        }
                    });
                }
            }

            // Since we're connected now, check for offer games again
            setTimeout(() => {
                console.log('[LobbyComponent-Debug] Post-connection offer games check');
                this.checkMainPlayerStore();
            }, 1000);

        } catch (error) {
            console.error('[LobbyComponent-Debug] Error manually connecting to gateway:', error);
        }
    }

    @render(gc.Player.MainPlayerStore, (store) => store.offerGames)
    handleOfferGames(offerGames: IOfferGame[]) {
        console.log('[LobbyComponent-SabaGames] Offer games updated - debug:', {
            receivedOfferGames: offerGames,
            hasOfferGames: !!offerGames,
            offerGamesLength: offerGames?.length || 0
        });
        console.log('[LobbyComponent] Offer games updated:', offerGames);

        if (offerGames?.length > 0) {
            const filteredOfferGames = lobbyUtils.getFilteredGames(offerGames);
            console.log('[LobbyComponent] Filtered offer games:', filteredOfferGames);

            const expandedGames = filteredOfferGames.reduce(
                (acc, game) => {
                    acc[game.gameId] = true;
                    return acc;
                },
                {} as { [key: number]: boolean },
            );
            console.log('[LobbyComponent] Setting expanded games:', expandedGames);

            this.setState({ offerGames: filteredOfferGames, expandedGames } as ILobbyState);

            if (!this.state.selectedGameId) {
                console.log('[LobbyComponent] No selected game ID, setting to first game:', filteredOfferGames[0].gameId);
                this.setState({ selectedGameId: filteredOfferGames[0].gameId });
            }
        }
    }

    @render(LobbyStore, (store) => store.tryToConnectCount)
    updateTryToConnectCount(tryToConnectCount: number) {
        console.log('[LobbyComponent] Try to connect count updated:', tryToConnectCount);
        const isDisconnect = tryToConnectCount > 0;
        if (isDisconnect) {
            console.log('[LobbyComponent] Disconnected, setting isRenderGame to false');
            this.setState({ isRenderGame: false });
            this.reRenderGameTimeout = setTimeout(() => {
                console.log('[LobbyComponent] Re-rendering game after timeout');
                this.setState({ isRenderGame: true });
            }, 500);
        }
    }

    @render(gc.Auth.AuthStore, (store) => store.username)
    private handleUsername(username: string) {
        console.log('[LobbyComponent] Username updated:', username);
        username && this.setState({ username });
    }

    updateLeagueToogle = (leagueToogle: boolean) => {
        console.log('[LobbyComponent] League toggle updated:', leagueToogle);
        this.setState({ leagueToogle });
    };

    handleTabClick = (gameId: number) => {
        console.log('[LobbyComponent] Tab clicked, game ID:', gameId);
        this.setState({ selectedGameId: gameId });
    };

    private renderGames(context) {
        console.log('[LobbyComponent-Debug] renderGames called with context:', context);
        const { offerGames, leagueToogle, selectedGameId, isSessionTimeout, isAuthenticated, username } = this.state;
        console.log('[LobbyComponent] Current state for rendering:', {
            offerGamesCount: offerGames.length,
            leagueToogle,
            selectedGameId,
            isSessionTimeout,
            isAuthenticated,
            username
        });

        // EMERGENCY FALLBACK: If authenticated but no games, try to get them directly
        if (isAuthenticated && offerGames.length === 0) {
            console.log('[LobbyComponent-Debug] EMERGENCY: Authenticated but no games, trying direct load');
            try {
                const maybeContainer = window['seal_shared_container'] || sharedContainer;
                let storeInstance: any = null;

                if (maybeContainer && maybeContainer.get) {
                    try {
                        storeInstance = maybeContainer.get(gc.Player.MainPlayerStore);
                    } catch (e) {
                        console.error('[LobbyComponent-Debug] Error getting store in emergency:', e);
                    }
                }

                if (storeInstance && storeInstance.offerGames && storeInstance.offerGames.length > 0) {
                    console.log('[LobbyComponent-Debug] EMERGENCY: Found offerGames directly:', storeInstance.offerGames);

                    // Filter and set games immediately
                    const directOfferGames = storeInstance.offerGames as IOfferGame[];
                    const filteredOfferGames = lobbyUtils.getFilteredGames(directOfferGames);

                    if (filteredOfferGames.length > 0) {
                        console.log('[LobbyComponent-Debug] EMERGENCY: Setting filtered games directly:', filteredOfferGames);

                        // Create a local copy of variables before setting state
                        const localOfferGames = filteredOfferGames;
                        const localSelectedGameId = filteredOfferGames[0].gameId;

                        // Proper setState call instead of direct mutation
                        this.setState({
                            offerGames: filteredOfferGames,
                            selectedGameId: localSelectedGameId
                        }, () => {
                            console.log('[LobbyComponent-Debug] EMERGENCY: State updated with filtered games');
                        });

                        console.log('[LobbyComponent-Debug] EMERGENCY: Using local variables for rendering');

                        // Return emergency render with the directly fetched games
                        return (
                            <>
                                <LeagueTabDropdown
                                    dropdownType={DropdownType.LEAGUE}
                                    leagueToogle={leagueToogle}
                                    updateLeagueToogle={this.updateLeagueToogle}
                                />
                                <GameListTab
                                    offerGames={localOfferGames}
                                    selectedGameId={localSelectedGameId}
                                    onTabClick={this.handleTabClick}
                                />
                                <GameMatchTab
                                    gameId={localSelectedGameId}
                                    className={styles['lobby-tabs']}
                                    leagueToogle={leagueToogle}
                                />
                            </>
                        );
                    }
                }
            } catch (error) {
                console.error('[LobbyComponent-Debug] EMERGENCY: Error in direct games load:', error);
            }
        }

        const renderGameContent = () => {
            console.log('[LobbyComponent-Debug] renderGameContent function called');

            if (isSessionTimeout) {
                console.log('[LobbyComponent] Rendering session timeout component');
                return (
                    <SessionTimeout
                        token={this.props.token}
                        renewToken={this.props.renewToken}
                        language={this.props.language}
                        username={username}
                    />
                );
            }

            const hasGames = offerGames.length > 0;
            console.log('[LobbyComponent-Debug] hasGames:', hasGames, 'isAuthenticated:', isAuthenticated);

            if (!hasGames || !isAuthenticated) {
                console.log('[LobbyComponent] No games or not authenticated, rendering loading component');
                return <Loading />;
            }

            console.log('[LobbyComponent-Debug] Rendering game content with offerGames:', offerGames);
            const selectedGame = offerGames.find((game) => game.gameId === selectedGameId) || offerGames[0];
            console.log('[LobbyComponent] Selected game for rendering:', selectedGame);

            return (
                <>
                    <GameListTab
                        offerGames={offerGames}
                        selectedGameId={selectedGameId}
                        onTabClick={this.handleTabClick}
                    />
                    <GameMatchTab gameId={selectedGame.gameId} className={styles['lobby-tabs']} leagueToogle={leagueToogle} />
                </>
            );
        };

        console.log('[LobbyComponent-Debug] About to call renderGameContent');
        const content = renderGameContent();
        console.log('[LobbyComponent-Debug] renderGameContent returned:', content ? 'content rendered' : 'no content');

        return (
            <>
                <LeagueTabDropdown
                    dropdownType={DropdownType.LEAGUE}
                    leagueToogle={leagueToogle}
                    updateLeagueToogle={this.updateLeagueToogle}
                />
                {content}
            </>
        );
    }

    render() {
        console.log('[LobbyComponent] Main render method called');
        return (
            <div className={styles['lobby']}>
                <AppContextConsumer>
                    {(context) => {
                        console.log('[LobbyComponent-Debug] AppContextConsumer rendered with context:', context);
                        return this.renderGames(context);
                    }}
                </AppContextConsumer>
            </div>
        );
    }

    checkMainPlayerStore = () => {
        try {
            // Try to get the store instance directly
            const maybeContainer = window['seal_shared_container'] || sharedContainer;
            let foundStore: any = null;

            // Try different ways to get the store
            if (maybeContainer && maybeContainer.get) {
                try {
                    foundStore = maybeContainer.get(gc.Player.MainPlayerStore);
                } catch (e) {
                    console.error('[LobbyComponent-SabaGames] Error getting store from container:', e);
                }
            }

            // Global fallback
            if (!foundStore && gc.Player.MainPlayerStore) {
                if (typeof gc.Player.MainPlayerStore === 'function') {
                    // Skip trying to instantiate - not needed and causes errors
                    console.log('[LobbyComponent-SabaGames] MainPlayerStore is a constructor');
                } else {
                    // It might be a singleton instance
                    foundStore = gc.Player.MainPlayerStore as any;
                }
            }

            if (foundStore) {
                const offerGames = foundStore.offerGames;
                console.log('[LobbyComponent-Debug] checkMainPlayerStore found offerGames:', {
                    hasOfferGames: !!offerGames,
                    offerGamesLength: offerGames?.length || 0,
                    currentStateOfferGamesLength: this.state.offerGames.length,
                    isAuthenticated: this.state.isAuthenticated
                });

                if (offerGames &&
                    JSON.stringify(offerGames) !== JSON.stringify(this.lastOfferGames) &&
                    offerGames.length > 0) {

                    console.log('[LobbyComponent-SabaGames] Detected offer games update in interval check:', offerGames);
                    this.lastOfferGames = offerGames;
                    this.handleOfferGames(offerGames as IOfferGame[]);
                }
            }

            // If we have authentication but no games, try to force a re-render
            if (this.state.isAuthenticated && this.state.offerGames.length === 0) {
                console.log('[LobbyComponent-Debug] Authenticated but no games, forcing render update');
                this.forceUpdate();
            }
        } catch (error) {
            console.error('[LobbyComponent-SabaGames] Error in checkMainPlayerStore:', error);
        }
    };
}

export default LobbyComponent;
