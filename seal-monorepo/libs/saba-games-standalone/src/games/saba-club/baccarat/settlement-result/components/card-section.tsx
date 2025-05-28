import React, { useCallback, useEffect, useState } from "react";

import { CardOrder } from "../../baccarat";
import Styles from "../styles/baccarat-animations.module.scss";
import { BaccaratCard } from "./baccarat-card";
import { ScoreDisplay } from "./score-display";
import { CardOrderWithTiming } from "./score-utils";

interface CardSectionProps {
    cards: CardOrderWithTiming[];
    label: string;
    type: 'player' | 'banker';
    playResultAnimation: boolean;
    isShowResult: boolean;
    isHideAllCards: boolean;
}

export const CardSection: React.FC<CardSectionProps> = ({ cards, label, type, playResultAnimation, isShowResult, isHideAllCards }) => {
    const [visibleScores, setVisibleScores] = useState<{ [key: number]: boolean }>({});
    const [cardContainerAnimClass, setCardContainerAnimClass] = useState('');

    // Reset states when show result changes
    useEffect(() => {
        if (!isShowResult) {
            setVisibleScores({});
        }
    }, [isShowResult]);

    useEffect(() => {
        if (isHideAllCards) {
            setCardContainerAnimClass(Styles['hide-all-cards']);
        } else if (!isHideAllCards && !isShowResult && !playResultAnimation) {
            setCardContainerAnimClass(Styles['show-all-cards']);
        } else {
            setCardContainerAnimClass('');
        }
    }, [isHideAllCards, isShowResult, playResultAnimation]);

    const handleCardFlip = useCallback(
        (card: CardOrder, accumulatedScore: number) => {
            // Add delay to match card flip animation completion
            setTimeout(() => {
                setVisibleScores((prev) => ({
                    ...prev,
                    [card.order]: true,
                }));
            }, 600); // Match the animation duration from BaccaratCard
        },
        [type],
    );

    return (
        <div className={`${Styles.cardSection}`}>
            <div className={`${Styles.label} ${type === 'player' ? Styles['label-player'] : Styles['label-banker']}`}>{label}</div>
            <div className={`${Styles.cardContainer} ${Styles[type]} ${cardContainerAnimClass}`}>
                {cards.map((card, index) => (
                    <BaccaratCard
                        playResultAnimation={playResultAnimation}
                        key={card.order}
                        type={type}
                        card={card}
                        isShowResult={isShowResult}
                        onCardFlip={handleCardFlip}
                    />
                ))}

                {isShowResult &&
                    cards.map((card, index) => (
                        <div key={card.order}>
                            <ScoreDisplay score={card.accumulatedScore} type={type} visible={visibleScores[card.order]} />
                        </div>
                    ))}
            </div>
        </div>
    );
};
