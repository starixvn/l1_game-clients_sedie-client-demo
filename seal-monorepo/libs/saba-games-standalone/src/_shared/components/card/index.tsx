import React from "react";

import card10Red from "../../../assets/cards/10-red.png";
import card10 from "../../../assets/cards/10.png";
import card2Red from "../../../assets/cards/2-red.png";
import card2 from "../../../assets/cards/2.png";
import card3Red from "../../../assets/cards/3-red.png";
import card3 from "../../../assets/cards/3.png";
import card4Red from "../../../assets/cards/4-red.png";
import card4 from "../../../assets/cards/4.png";
import card5Red from "../../../assets/cards/5-red.png";
import card5 from "../../../assets/cards/5.png";
import card6Red from "../../../assets/cards/6-red.png";
import card6 from "../../../assets/cards/6.png";
import card7Red from "../../../assets/cards/7-red.png";
import card7 from "../../../assets/cards/7.png";
import card8Red from "../../../assets/cards/8-red.png";
import card8 from "../../../assets/cards/8.png";
import card9Red from "../../../assets/cards/9-red.png";
import card9 from "../../../assets/cards/9.png";
import cardARed from "../../../assets/cards/A-red.png";
import cardA from "../../../assets/cards/A.png";
import cardFront from "../../../assets/cards/card-front.svg";
import club from "../../../assets/cards/club.png";
import diamond from "../../../assets/cards/diamond.png";
import heart from "../../../assets/cards/heart.png";
import cardJRed from "../../../assets/cards/J-red.png";
import cardJ from "../../../assets/cards/J.png";
import cardKRed from "../../../assets/cards/K-red.png";
import cardK from "../../../assets/cards/K.png";
import cardQRed from "../../../assets/cards/Q-red.png";
import cardQ from "../../../assets/cards/Q.png";
import spade from "../../../assets/cards/spade.png";
import Styles from "./card.module.scss";
import { MiniCard } from "./components/mini-card";
import { Props } from "./type";
import { convertRank, suffixNameMapping } from "./utils/card-utils";

export const EmptyCardIndex = -1;

const cardImages: Record<string, string> = {
    A: cardA,
    K: cardK,
    Q: cardQ,
    J: cardJ,
    '10': card10,
    '9': card9,
    '8': card8,
    '7': card7,
    '6': card6,
    '5': card5,
    '4': card4,
    '3': card3,
    '2': card2,
    ARed: cardARed,
    KRed: cardKRed,
    QRed: cardQRed,
    JRed: cardJRed,
    '10Red': card10Red,
    '9Red': card9Red,
    '8Red': card8Red,
    '7Red': card7Red,
    '6Red': card6Red,
    '5Red': card5Red,
    '4Red': card4Red,
    '3Red': card3Red,
    '2Red': card2Red,
    diamond: diamond,
    club: club,
    spade: spade,
    heart: heart,
};

const Card: React.FC<Props> = (props) => {
    const { result, isSmall, viewMode = '' } = props;
    const customClassName = props.customClassName ?? '';
    const isDisplayMiniCard = isSmall;

    const getCardsDefault = () => {
        const rankRed = result?.type > 1 ? '' : 'Red';
        const rankImageUrl = cardImages[`${convertRank(result?.card)}${rankRed}`];
        const suitImageUrl = cardImages[`${suffixNameMapping[result?.type]}`];
        return (
            <div className={Styles['card-front-box']}>
                <img src={`${cardFront}#v1`} className={Styles['card-front']} alt="card-front" />
                <img src={rankImageUrl} className={Styles['card-rank']} width="20" height="20" />
                <img src={suitImageUrl} className={Styles['card-suit']} width="42" height="56" />
            </div>
        );
    };

    if (result.card === EmptyCardIndex) {
        return null;
    }

    return (
        <div className={`${Styles[customClassName]} ${Styles['card']} `}>
            <div className={Styles['result']} data-testid="result-card">
                {isDisplayMiniCard ? <MiniCard card={result.card} type={result.type} /> : getCardsDefault()}
            </div>
        </div>
    );
};

export default Card;
