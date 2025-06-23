import React, { useEffect, useState, useRef } from "react";

import Card from "..";
import CardBack from "../card-back";
import { CardResult } from "../type";
import Styles from "./flip-card.module.scss";

interface FlipCardProps {
    card: CardResult;
    isShowResult: boolean;
    playResultAnimation?: boolean;
    delayTime?: number;
    onFlipComplete?: () => void;
}

export const FlipCard: React.FC<FlipCardProps> = ({
    card,
    isShowResult,
    playResultAnimation,
    delayTime = 0,
    onFlipComplete
}) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [flipAnimationClass, setFlipAnimationClass] = useState('');
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cardElement = cardRef.current;
        if (!cardElement) return;

        const handleTransitionEnd = (e: TransitionEvent) => {
            if (e.propertyName === 'transform') {
                onFlipComplete?.();
            }
        };

        cardElement.addEventListener('transitionend', handleTransitionEnd);
        return () => {
            cardElement.removeEventListener('transitionend', handleTransitionEnd);
        };
    }, [onFlipComplete]);

    useEffect(() => {
        if (isFlipped && playResultAnimation) {
            setFlipAnimationClass(Styles['flip']);
        } else if (isFlipped) {
            setFlipAnimationClass(`${Styles['flip']} ${Styles['no-animation']}`);
            onFlipComplete?.();
        } else {
            setFlipAnimationClass('');
        }
    }, [isFlipped, playResultAnimation]);

    useEffect(() => {
        if (isShowResult) {
            if (delayTime > 0) {
                const timer = setTimeout(() => {
                    setIsFlipped(true);
                }, delayTime);
                return () => clearTimeout(timer);
            } else {
                setIsFlipped(true);
            }
        } else {
            setIsFlipped(false);
        }
    }, [isShowResult, card]);

    return (
        <div ref={cardRef} className={`${Styles.card} ${flipAnimationClass}`}>
            <div className={Styles['rotate-card']}>
                <div className={Styles.cardFace}>
                    <div className={Styles['card-back']}>
                        <CardBack />
                    </div>
                    <div className={Styles['card-front']}>
                        <Card result={card} customClassName={'card-baccarat'} />
                    </div>
                </div>
            </div>
        </div>
    );
};
