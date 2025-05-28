import React, { useState, useEffect, useRef } from 'react';
import { FishPrawnCrabSymbol, diceValueToSymbol } from './index';
import FishPrawnCrabDice from './index';
import { Size } from "../../constants";
import styles from './fish-prawn-crab-dice.module.scss';

interface AnimatedDiceProps {
    finalSymbol: FishPrawnCrabSymbol;
    size?: typeof Size.large | typeof Size.medium | typeof Size.small;
    animationDuration?: number;
    onAnimationComplete?: () => void;
    delayStart?: number;
    finalRollDelay?: number;
}

const AnimatedDice: React.FC<AnimatedDiceProps> = ({
    finalSymbol,
    size = Size.large,
    animationDuration = 3000,
    onAnimationComplete,
    delayStart = 0,
    finalRollDelay = 0
}) => {
    // Current displayed symbol
    const [currentSymbol, setCurrentSymbol] = useState<FishPrawnCrabSymbol>(FishPrawnCrabSymbol.EMPTY);

    // Animation state
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [shakeFrequency, setShakeFrequency] = useState<number>(0.2); // Initial shake duration (faster)
    const [rollSpeed, setRollSpeed] = useState<string>(''); // Roll animation class

    // Used to track animation timing
    const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
    const rollTimersRef = useRef<NodeJS.Timeout[]>([]);

    // Generate random symbol (1-6)
    const getRandomSymbol = (): FishPrawnCrabSymbol => {
        const randomValue = Math.floor(Math.random() * 6) + 1; // 1-6
        return diceValueToSymbol(randomValue);
    };

    // Cleanup function
    const clearTimers = () => {
        rollTimersRef.current.forEach(timer => clearTimeout(timer));
        rollTimersRef.current = [];

        if (animationTimerRef.current) {
            clearTimeout(animationTimerRef.current);
            animationTimerRef.current = null;
        }
    };

    // Start animation
    const startAnimation = () => {
        clearTimers(); // Clear any existing timers
        setIsAnimating(true);

        // Define roll timings based on requirements:
        // - 4 first rolls with 0.1s between them
        // - 2 next rolls with 0.2s between them
        // - Next roll with 0.3s delay
        // - Last roll with 0.4s delay + finalRollDelay
        const rollTimes = [
            0,           // First roll immediately
            100,         // +0.1s
            200,         // +0.1s
            300,         // +0.1s
            400,         // +0.1s
            600,         // +0.2s
            800,         // +0.2s
            1100,        // +0.3s
            1500 + finalRollDelay  // +0.4s (final reveal) + finalRollDelay
        ];

        // Total animation duration adjusted for finalRollDelay
        const totalDuration = animationDuration + finalRollDelay;

        // Keep track of which main roll we're currently in
        let currentRollIndex = 0;

        // Number of symbol changes per roll (mini-physics simulation within each roll)
        const symbolsPerRoll = 6;

        // Schedule physics-based symbol changes within each roll window
        for (let i = 0; i < rollTimes.length - 1; i++) {
            const rollStartTime = rollTimes[i];
            const nextRollTime = rollTimes[i + 1];
            const rollDuration = nextRollTime - rollStartTime;

            // Calculate how far into the animation this roll is (for proper physics feel)
            const rollProgress = rollStartTime / totalDuration;

            // Apply different physics behavior based on which phase we're in
            // Early rolls: faster changes (acceleration)
            // Middle rolls: peak speed
            // Later rolls: slower changes (deceleration)

            for (let j = 0; j < symbolsPerRoll; j++) {
                let symbolTime: number;

                if (i < 4) {
                    // First 4 rolls: acceleration phase - non-linear distribution
                    // Earlier symbols change slower, later symbols change faster
                    const adjustedProgress = Math.pow(j / symbolsPerRoll, 1.5);
                    symbolTime = rollStartTime + Math.floor(adjustedProgress * rollDuration);
                }
                else if (i < 6) {
                    // Middle 2 rolls: peak speed - evenly distributed
                    symbolTime = rollStartTime + Math.floor(j * (rollDuration / symbolsPerRoll));
                }
                else {
                    // Last 2 rolls: deceleration phase - non-linear distribution
                    // Earlier symbols change faster, later symbols change slower
                    const adjustedProgress = 1 - Math.pow(1 - (j / symbolsPerRoll), 1.5);
                    symbolTime = rollStartTime + Math.floor(adjustedProgress * rollDuration);
                }

                const timer = setTimeout(() => {
                    // Apply 3D roll animation for each symbol change
                    setCurrentSymbol(getRandomSymbol());
                    // Trigger a new roll animation
                    if (i < 4) {
                        // Fast rolling for early phase
                        setRollSpeed(styles['dice-rolling-fast']);
                    } else if (i < 6) {
                        // Medium rolling for middle phase
                        setRollSpeed(styles['dice-rolling-medium']);
                    } else {
                        // Slow rolling for final phase
                        setRollSpeed(styles['dice-rolling-slow']);
                    }

                    // Clear the animation class after it finishes
                    const animDuration = i < 4 ? 300 : i < 6 ? 500 : 700;
                    const clearTimer = setTimeout(() => {
                        setRollSpeed('');
                    }, animDuration);
                    rollTimersRef.current.push(clearTimer);
                }, symbolTime);

                rollTimersRef.current.push(timer);
            }

            // Set shake frequency for this roll
            const timer = setTimeout(() => {
                if (i < 2) {
                    // First 2 rolls: Fast shaking (initial toss)
                    setShakeFrequency(0.2);
                }
                else if (i < 5) {
                    // Next 3 rolls: Medium shaking
                    setShakeFrequency(0.4);
                }
                else {
                    // Last rolls: Slow shaking (settling)
                    setShakeFrequency(0.7);
                }
            }, rollStartTime);

            rollTimersRef.current.push(timer);
        }

        // Add highlight symbols at exact roll times
        rollTimes.forEach((time, index) => {
            if (index < rollTimes.length - 1) { // Skip the last time (final reveal)
                const timer = setTimeout(() => {
                    // Highlight roll point with a new symbol
                    setCurrentSymbol(getRandomSymbol());
                    // Apply appropriate rolling animation
                    if (index < 4) {
                        setRollSpeed(styles['dice-rolling-fast']);
                    } else if (index < 6) {
                        setRollSpeed(styles['dice-rolling-medium']);
                    } else {
                        setRollSpeed(styles['dice-rolling-slow']);
                    }

                    // Clear the animation class after it finishes
                    const animDuration = index < 4 ? 300 : index < 6 ? 500 : 700;
                    const clearTimer = setTimeout(() => {
                        setRollSpeed('');
                    }, animDuration);
                    rollTimersRef.current.push(clearTimer);
                }, time);

                rollTimersRef.current.push(timer);
            }
        });

        // Final reveal (show the final symbol)
        const finalRevealTimer = setTimeout(() => {
            setCurrentSymbol(finalSymbol);
            setIsAnimating(false);
            // One last slow roll animation for the final reveal
            setRollSpeed(styles['dice-rolling-slow']);

            const clearTimer = setTimeout(() => {
                setRollSpeed('');
                if (onAnimationComplete) {
                    onAnimationComplete();
                }
            }, 700);
            rollTimersRef.current.push(clearTimer);
        }, rollTimes[rollTimes.length - 1]);

        rollTimersRef.current.push(finalRevealTimer);

        // Set a backup timeout to ensure animation always completes
        animationTimerRef.current = setTimeout(() => {
            clearTimers();
            setCurrentSymbol(finalSymbol);
            setIsAnimating(false);
            setRollSpeed('');
            if (onAnimationComplete) {
                onAnimationComplete();
            }
        }, totalDuration + 100); // Add a small buffer
    };

    // Handle component mount/unmount and props changes
    useEffect(() => {
        if (delayStart > 0) {
            const delayTimer = setTimeout(() => {
                startAnimation();
            }, delayStart);

            return () => clearTimeout(delayTimer);
        } else {
            startAnimation();
        }

        return () => {
            clearTimers();
        };
    }, [finalSymbol, animationDuration, delayStart, finalRollDelay]); // Added finalRollDelay as a dependency

    // Get CSS class based on shake frequency
    const getShakeFrequencyClass = () => {
        if (!isAnimating) return styles['no-animation'];

        if (shakeFrequency === 0.2) return styles['shake-frequency-0-2'];
        if (shakeFrequency === 0.4) return styles['shake-frequency-0-4'];
        if (shakeFrequency === 0.7) return styles['shake-frequency-0-7'];

        return styles['shake-frequency-0-2']; // Default
    };

    return (
        <div className={styles['dice-container']}>
            <div
                className={`${styles['dice-rolling']} ${rollSpeed} ${styles['animated-dice-wrapper']} ${isAnimating ? styles['animated-dice-wrapper-shaking'] : ''} ${getShakeFrequencyClass()}`}
            >
                <FishPrawnCrabDice
                    symbol={currentSymbol}
                    size={size}
                />
            </div>
        </div>
    );
};

// Component for a set of animated dice
interface AnimatedDiceSetProps {
    finalSymbols: FishPrawnCrabSymbol[];
    size?: typeof Size.large | typeof Size.medium | typeof Size.small;
    animationDuration?: number;
    onAllAnimationsComplete?: () => void;
    staggerDelay?: number;
    finalRollSequenceDelay?: number;
}

export const AnimatedDiceSet: React.FC<AnimatedDiceSetProps> = ({
    finalSymbols,
    size = Size.large,
    animationDuration = 3000,
    onAllAnimationsComplete,
    staggerDelay = 100,
    finalRollSequenceDelay = 200
}) => {
    const [completedAnimations, setCompletedAnimations] = useState(0);

    useEffect(() => {
        if (completedAnimations === finalSymbols.length && onAllAnimationsComplete) {
            onAllAnimationsComplete();
        }
    }, [completedAnimations, finalSymbols.length, onAllAnimationsComplete]);

    const handleAnimationComplete = () => {
        setCompletedAnimations(prev => prev + 1);
    };

    return (
        <div className={styles['dice-set-container']}>
            {finalSymbols.map((symbol, index) => (
                <AnimatedDice
                    key={index}
                    finalSymbol={symbol}
                    size={size}
                    animationDuration={animationDuration}
                    onAnimationComplete={handleAnimationComplete}
                    delayStart={index * staggerDelay}
                    finalRollDelay={index * finalRollSequenceDelay}
                />
            ))}
        </div>
    );
};

export default AnimatedDice; 