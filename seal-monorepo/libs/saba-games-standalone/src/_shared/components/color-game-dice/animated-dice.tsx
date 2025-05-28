import React, { useState, useEffect, useRef } from 'react';
import { ColorGameSymbol } from './index';
import ColorGameDice from './index';
import { Size } from "../../constants";
import styles from './color-game-dice.module.scss';

// Types and Interfaces
interface DiceFaceProps {
    transform: string;
    symbol: ColorGameSymbol;
    size: typeof Size.large | typeof Size.medium | typeof Size.small;
}

interface AnimationConfig {
    duration: number;
    delayStart: number;
    finalRollDelay: number;
    diceIndex: number;
}

interface AnimatedDiceProps {
    finalSymbol: ColorGameSymbol;
    size?: typeof Size.large | typeof Size.medium | typeof Size.small;
    animationConfig?: Partial<AnimationConfig>;
    onAnimationComplete?: () => void;
}

// Constants
const DICE_SYMBOLS_LIST = [
    ColorGameSymbol.YELLOW,
    ColorGameSymbol.RED,
    ColorGameSymbol.PINK,
    ColorGameSymbol.WHITE,
    ColorGameSymbol.BLUE,
    ColorGameSymbol.GREEN,
];

const DICE_FACES = [
    { transform: 'translateZ(23px)' },
    { transform: 'rotateY(180deg) translateZ(23px)' },
    { transform: 'rotateY(90deg) translateZ(23px)' },
    { transform: 'rotateY(-90deg) translateZ(23px)' },
    { transform: 'rotateX(90deg) translateZ(23px)' },
    { transform: 'rotateX(-90deg) translateZ(23px)' },
];

// Utility Functions
const getOrderedSymbols = (finalSymbol: ColorGameSymbol): ColorGameSymbol[] => {
    const sequence: ColorGameSymbol[] = new Array(6);
    sequence[0] = finalSymbol;

    let currentIndex = 1;
    for (const symbol of DICE_SYMBOLS_LIST) {
        if (symbol !== finalSymbol) {
            sequence[currentIndex] = symbol;
            currentIndex++;
        }
    }

    return sequence;
};

// Components
const DiceFace: React.FC<DiceFaceProps> = ({ transform, symbol, size }) => (
    <div className={styles['dice-face']} style={{ transform }}>
        <ColorGameDice symbol={symbol} size={size} isWooden={true} />
    </div>
);

// Animation Hook
const useDiceAnimation = (
    finalSymbol: ColorGameSymbol,
    config: AnimationConfig,
    onAnimationComplete?: () => void
) => {
    const [currentSymbol, setCurrentSymbol] = useState<ColorGameSymbol>(ColorGameSymbol.BLUE);
    const [rotationClass, setRotationClass] = useState<string>('');
    const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
    const rollTimersRef = useRef<NodeJS.Timeout[]>([]);

    const clearTimers = () => {
        rollTimersRef.current.forEach(timer => clearTimeout(timer));
        rollTimersRef.current = [];

        if (animationTimerRef.current) {
            clearTimeout(animationTimerRef.current);
            animationTimerRef.current = null;
        }
    };

    const startAnimation = () => {
        clearTimers();

        const rollTimes = [0, 3600];
        const totalDuration = config.duration + config.finalRollDelay;

        rollTimes.forEach((time, index) => {
            if (index < rollTimes.length - 1) {
                const timer = setTimeout(() => {
                    const rotationType = index === 0 ? `rotate-${config.diceIndex}` : '';
                    setRotationClass(styles[rotationType]);

                    const animDuration = 3600;

                    const setFinalSymbol = setTimeout(() => {
                        setCurrentSymbol(finalSymbol);
                    }, animDuration * 0.9);
                    rollTimersRef.current.push(setFinalSymbol);

                    const clearTimer = setTimeout(() => {
                        setRotationClass('');
                        if (index === rollTimes.length - 2 && onAnimationComplete) {
                            onAnimationComplete();
                        }
                    }, animDuration);
                    rollTimersRef.current.push(clearTimer);
                }, time);

                rollTimersRef.current.push(timer);
            }
        });

        animationTimerRef.current = setTimeout(() => {
            clearTimers();
            setRotationClass('');
            if (onAnimationComplete) {
                onAnimationComplete();
            }
        }, totalDuration + 100);
    };

    useEffect(() => {
        if (config.delayStart > 0) {
            const delayTimer = setTimeout(startAnimation, config.delayStart);
            return () => clearTimeout(delayTimer);
        } else {
            startAnimation();
        }

        return clearTimers;
    }, [finalSymbol, config.duration, config.delayStart, config.finalRollDelay]);

    return { currentSymbol, rotationClass };
};

// Main Component
const AnimatedDice: React.FC<AnimatedDiceProps> = ({
    finalSymbol,
    size = Size.large,
    animationConfig = {},
    onAnimationComplete
}) => {
    const defaultConfig: AnimationConfig = {
        duration: 3000,
        delayStart: 0,
        finalRollDelay: 0,
        diceIndex: 1,
        ...animationConfig
    };

    const { currentSymbol, rotationClass } = useDiceAnimation(
        finalSymbol,
        defaultConfig,
        onAnimationComplete
    );

    const orderedSymbols = getOrderedSymbols(finalSymbol);

    return (
        <div className={styles['dice-container']}>
            <div className={`${styles['dice-3d']} ${rotationClass}`}>
                {DICE_FACES.map((face, index) => (
                    <DiceFace
                        key={index}
                        transform={face.transform}
                        symbol={orderedSymbols[index]}
                        size={size}
                    />
                ))}
            </div>
        </div>
    );
};

// Dice Set Component
interface AnimatedDiceSetProps {
    finalSymbols: ColorGameSymbol[];
    size?: typeof Size.large | typeof Size.medium | typeof Size.small | typeof Size.xLarge;
    animationConfig?: Partial<AnimationConfig>;
    onAllAnimationsComplete?: () => void;
    staggerDelay?: number;
    finalRollSequenceDelay?: number;
}

export const AnimatedDiceSet: React.FC<AnimatedDiceSetProps> = ({
    finalSymbols,
    size = Size.large,
    animationConfig = {},
    onAllAnimationsComplete,
    staggerDelay = 500,
    finalRollSequenceDelay = 700
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
                    animationConfig={{
                        ...animationConfig,
                        delayStart: index * staggerDelay,
                        finalRollDelay: index * finalRollSequenceDelay,
                        diceIndex: (index % 3) + 1
                    }}
                    onAnimationComplete={handleAnimationComplete}
                />
            ))}
        </div>
    );
};

export default AnimatedDice; 