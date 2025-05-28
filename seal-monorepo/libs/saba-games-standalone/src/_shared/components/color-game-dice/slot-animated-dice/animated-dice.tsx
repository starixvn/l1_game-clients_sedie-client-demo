import React, { useState, useEffect, useRef } from 'react';
import { ColorGameSymbol } from '../index';
import ColorGameDice from '../index';
import styles from './color-game-dice.module.scss';
import { Size } from '../../../constants';

const DICE_SYMBOLS_LIST = [
    ColorGameSymbol.YELLOW,
    ColorGameSymbol.RED,
    ColorGameSymbol.PINK,
    ColorGameSymbol.WHITE,
    ColorGameSymbol.BLUE,
    ColorGameSymbol.GREEN,
];

interface AnimatedDiceProps {
    finalSymbol: ColorGameSymbol;
    onAnimationComplete?: () => void;
    delayStart?: number;
    totalDuration?: number;
}

const AnimatedDice: React.FC<AnimatedDiceProps> = ({
    finalSymbol,
    onAnimationComplete,
    delayStart = 0,
    totalDuration = 2200
}) => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [currentData, setCurrentData] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);
    const interval = 100;

    useEffect(() => {
        const delayTimer = setTimeout(() => {
            setIsAnimating(true);
        }, delayStart);

        return () => clearTimeout(delayTimer);
    }, [delayStart]);

    useEffect(() => {
        if (isAnimating) {
            let increment = 0;
            const totalSteps = totalDuration / interval;

            const timer = setInterval(() => {
                increment++;

                const newAngle = increment * -60;
                const newState = (increment % 6) + 1;

                if (carouselRef.current) {
                    carouselRef.current.style.transform = `rotateX(${newAngle}deg)`;
                    setCurrentData(newState);

                    if (increment >= totalSteps) {
                        const current = (increment % 6) + 1;
                        const diff = (finalSymbol + 1 - current + 6) % 6;
                        increment += diff;

                        carouselRef.current.style.transform = `rotateX(${increment * -60}deg)`;
                        setCurrentData((increment % 6) + 1);
                        if (onAnimationComplete) {
                            onAnimationComplete();
                        }
                        clearInterval(timer);
                    }
                }
            }, interval);

            return () => clearInterval(timer);
        }
    }, [finalSymbol, totalDuration, interval, isAnimating]);

    return (
        <div className={styles['carousel-wrapper']}>
            <div
                className={styles['carousel']}
                data-currentData={currentData}
                ref={carouselRef}
            >
                {DICE_SYMBOLS_LIST.map((symbol, index) => (
                    <figure key={index}>
                        <ColorGameDice symbol={symbol} size={Size.large} />
                    </figure>
                ))}
            </div>
        </div>
    );
};

interface AnimatedDiceSetProps {
    finalSymbols: ColorGameSymbol[];
    onAllAnimationsComplete?: () => void;
    staggerDelay?: number;
}

export const AnimatedDiceSet: React.FC<AnimatedDiceSetProps> = ({
    finalSymbols,
    onAllAnimationsComplete,
    staggerDelay = 100,
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
                    onAnimationComplete={handleAnimationComplete}
                    delayStart={index * staggerDelay}
                />
            ))}
        </div>
    );
};

export default AnimatedDice; 