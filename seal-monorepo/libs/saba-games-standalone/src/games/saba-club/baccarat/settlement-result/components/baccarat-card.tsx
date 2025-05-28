import React, { useEffect, useState } from "react";

import Card from "../../../../../_shared/components/card";
import CardBack from "../../../../../_shared/components/card/card-back";
import { CardOrder } from "../../baccarat";
import { CARD_TIMINGS } from "../constants";
import Styles from "../styles/baccarat-card.module.scss";

interface BaccaratCardProps {
    card: CardOrder;
    className?: string;
    isShowResult: boolean;
    type: 'player' | 'banker';
    onCardFlip?: (card: CardOrder, accumulatedScore: number) => void;
    playResultAnimation?: boolean;
}

export const BaccaratCard: React.FC<BaccaratCardProps> = ({ card, className, isShowResult, type, onCardFlip, playResultAnimation }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [flipAnimationClass, setFlipAnimationClass] = useState('');

    useEffect(() => {
        if (isFlipped && playResultAnimation) {
            setFlipAnimationClass(Styles['flip']);
        } else if (isFlipped) {
            setFlipAnimationClass(`${Styles['flip']} ${Styles['no-animation']}`);
        } else {
            setFlipAnimationClass('');
        }
    }, [isFlipped, playResultAnimation]);

    // Add rotation class based on card order
    const getRotationClass = (order: number) => {
        if (order === 5) return Styles['rotate-right']; // Player's third card
        if (order === 6) return Styles['rotate-left']; // Banker's third card
        return '';
    };

    // Add banker third card class when it's the third card and player has only 2 cards
    const getBankerThirdCardClass = (order: number) => {
        if (order === 5 && !card.playerHasThirdCard) {
            return Styles['banker-third-card'];
        }
        return '';
    };

    useEffect(() => {
        if (isShowResult) {
            // Sequential card opening
            let delay;
            switch (card.order) {
                case 1:
                    delay = playResultAnimation ? CARD_TIMINGS.CARD_1 : 0;
                    break;
                case 3:
                    delay = playResultAnimation ? CARD_TIMINGS.CARD_3 : 0;
                    break;
                case 2:
                    delay = playResultAnimation ? CARD_TIMINGS.CARD_2 : 0;
                    break;
                case 4:
                    delay = playResultAnimation ? CARD_TIMINGS.CARD_4 : 0;
                    break;
                case 5:
                    delay = playResultAnimation ? CARD_TIMINGS.CARD_5 : 0;
                    break;
                case 6:
                    delay = playResultAnimation ? CARD_TIMINGS.CARD_6 : 0;
                    break;
                default:
                    delay = 0;
            }

            const flipTimer = setTimeout(() => {
                setIsFlipped(true);
                if (onCardFlip) {
                    onCardFlip(card, card.accumulatedScore);
                }
            }, delay);

            return () => clearTimeout(flipTimer);
        } else {
            setIsFlipped(false);
        }
    }, [isShowResult, card, onCardFlip, playResultAnimation]);

    return (
        <div
            className={`${Styles.card} ${Styles[type]}  ${Styles[`card${card.order}`]} ${flipAnimationClass} ${getRotationClass(card.order)} ${getBankerThirdCardClass(card.order)} ${className || ''}`}
        >
            <div className={Styles['rotate-card']}>
                <div className={Styles.cardFace}>
                    <div className={Styles['card-back']}>
                        <CardBack />
                    </div>
                    <div className={Styles['card-front']}>
                        <Card result={card.value} customClassName={'card-baccarat'} />
                    </div>
                </div>
            </div>
        </div>
    );
};
