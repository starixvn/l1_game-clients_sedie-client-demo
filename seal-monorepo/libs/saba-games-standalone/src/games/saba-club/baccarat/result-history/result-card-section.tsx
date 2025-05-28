import React from "react";
import { Cards } from "../baccarat";
import Styles from "./result-baccarat-animations.module.scss";
import { ResultStaticBaccaratCard } from "./result-static-baccarat-card";

interface ResultCardSectionProps {
    cards: Cards;
}

export const ResultCardSection: React.FC<ResultCardSectionProps> = ({
    cards,
}) => {

    return (
        <div className={Styles.resultCardSection} data-testid="result-card-section" style={{ transform: "scale(0.7)" }}>
            <div className={Styles.cardContainer}>
                {Object.values(cards).map((card, index) => (
                    card && <div key={index} className={Styles.cardWrapper}>
                        <ResultStaticBaccaratCard card={card} />
                    </div>
                ))}
            </div>
        </div>
    );
}; 