import React from "react";
import { isIOS, isMobileOnly } from "react-device-detect";
import { suffixNameMapping, colorNumberSuffix, convertRank } from "../utils/card-utils";
import Styles from "../card.module.scss";

interface MiniCardProps {
    card: number;
    type: number;
}

export const MiniCard: React.FC<MiniCardProps> = ({ card, type }) => {
    const getClassOnIOS = () => isIOS && isMobileOnly ? "number-ios" : "";
    const getClassCard10 = () => +convertRank(card) === 10 ? "card-number-10" : "";

    return (
        <>
            <div
                className={`${Styles[colorNumberSuffix[type]]} ${Styles["card-number"]} ${Styles[getClassCard10()]} ${Styles[getClassOnIOS()]}`}
            >
                {convertRank(card)}
            </div>
            <img
                src={`../../../../../assets/cards/mini/mini-${suffixNameMapping[type]}.svg`}
                className={Styles["card-suite-mini"]}
                height={49.07}
                width={34.5}
                alt="suite"
            />
        </>
    );
}; 