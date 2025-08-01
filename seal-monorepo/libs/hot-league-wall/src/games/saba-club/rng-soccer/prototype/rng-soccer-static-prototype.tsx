import React, { useState, useEffect } from 'react';
import { FAKE_RNG_SOCCER_DATA } from './fake-data';
import RNGSoccerBase, { RNGSoccerGameData } from './rng-soccer-base';
import { useSentryHelper, SentryLogLevel } from 'sg-sentry';

// Static prototype component for RNG Soccer
export const RNGSoccerStaticPrototype: React.FC<{
    onPlayButtonClick?: () => Promise<void>;
    isLoading?: boolean;
}> = ({ onPlayButtonClick, isLoading = false }) => {
    const [currentState, setCurrentState] = useState<RNGSoccerGameData>(FAKE_RNG_SOCCER_DATA);
    const [countdown, setCountdown] = useState(10);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isPlayButtonVisible, setIsPlayButtonVisible] = useState(true);
    const ANIMATION_TIME = 10;

    // Initialize SentryHelper for RNG Soccer prototype
    const { logError, logWarning, logInfo, workflowTracker } = useSentryHelper({
        componentName: 'RNGSoccerStaticPrototype',
        logLevel: SentryLogLevel.INFO,
        enableWorkflowTracking: true,
        enablePerformanceTracking: true
    });

    // Simulate countdown timer
    useEffect(() => {
        try {
            logInfo('Starting countdown timer', {
                initialCountdown: countdown,
                animationTime: ANIMATION_TIME,
                timestamp: Date.now()
            });

            const timer = setInterval(() => {
                try {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            logInfo('Countdown reset', {
                                newCountdown: ANIMATION_TIME,
                                timestamp: Date.now()
                            });
                            return ANIMATION_TIME;
                        }
                        return prev - 1;
                    });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    logError(`Countdown timer update failed: ${errorMessage}`, {
                        error,
                        operation: 'countdown_timer_update',
                        currentCountdown: countdown
                    });
                }
            }, 1000);
            return () => clearInterval(timer);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logError(`Countdown timer setup failed: ${errorMessage}`, {
                error,
                operation: 'countdown_timer_setup',
                initialCountdown: countdown,
                animationTime: ANIMATION_TIME
            });
        }
    }, [logInfo, logError]);

    // Simulate round state changes
    useEffect(() => {
        try {
            let roundState = 'placingBets';
            if (countdown <= 8) roundState = 'showingResult';
            if (countdown <= 3) roundState = 'lockingBet';

            setCurrentState((prev) => ({
                ...prev,
                currentRound: {
                    ...prev.currentRound,
                    roundState,
                    countdownTimer: countdown,
                    isLocking: roundState === 'lockingBet',
                },
            }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logError(`Round state update failed: ${errorMessage}`, {
                error,
                operation: 'round_state_update',
                countdown,
                currentState
            });
        }
    }, [countdown, logError]);

    const handlePlayClick = async () => {
        const workflowId = workflowTracker.start('Play Button Click', {
            isPlayButtonVisible,
            isLoading,
            timestamp: Date.now()
        });

        logInfo('Play button clicked', {
            isPlayButtonVisible,
            isLoading,
            timestamp: Date.now()
        });

        setIsPlayButtonVisible(false);

        if (onPlayButtonClick) {
            try {
                await workflowTracker.track('SSO Token Request', async () => {
                    return await onPlayButtonClick();
                });

                workflowTracker.complete(workflowId, true, {
                    success: true,
                    timestamp: Date.now()
                });
                logInfo('Play button flow completed successfully', {
                    timestamp: Date.now()
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                workflowTracker.complete(workflowId, false, {
                    error: errorMessage,
                    timestamp: Date.now()
                });
                logError(`Play button flow failed: ${errorMessage}`, {
                    error,
                    timestamp: Date.now()
                });
                // Re-show the play button if there was an error
                setIsPlayButtonVisible(true);
            }
        } else {
            workflowTracker.complete(workflowId, false, {
                reason: 'no_onPlayButtonClick_provided',
                timestamp: Date.now()
            });
            logWarning('No onPlayButtonClick provided', {
                timestamp: Date.now()
            });
        }
    };

    const handleBet = (choice: string) => {
        logInfo('Bet placed', {
            choice,
            countdown,
            timestamp: Date.now()
        });

        setTimeout(() => {
            setCurrentState((prev) => ({
                ...prev,
                uiState: {
                    ...prev.uiState,
                    isShowNextRoundMessage: true,
                },
            }));

            logInfo('Showing next round message', {
                choice,
                timestamp: Date.now()
            });

            setTimeout(() => {
                setCurrentState((prev) => ({
                    ...prev,
                    uiState: {
                        ...prev.uiState,
                        isShowNextRoundMessage: false,
                    },
                }));

                logInfo('Hiding next round message', {
                    choice,
                    timestamp: Date.now()
                });
            }, 3000);
        }, 1000);
    };

    const togglePopup = () => {
        const newPopupState = !isPopupVisible;
        setIsPopupVisible(newPopupState);

        logInfo('Statistics popup toggled', {
            newState: newPopupState,
            timestamp: Date.now()
        });
    };

    return (
        <RNGSoccerBase
            gameData={currentState}
            onBetClick={handleBet}
            onStatisticsClick={togglePopup}
            showPlayOverlay={isPlayButtonVisible}
            onPlayClick={handlePlayClick}
            isInteractive={true}
            showStatisticsPopup={isPopupVisible}
            onCloseStatistics={togglePopup}
            isLoading={isLoading}
        />
    );
};

export default RNGSoccerStaticPrototype;
