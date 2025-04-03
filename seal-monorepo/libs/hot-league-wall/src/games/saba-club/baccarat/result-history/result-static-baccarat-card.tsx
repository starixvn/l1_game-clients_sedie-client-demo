import React from "react";
import Card from "../../../../_shared/components/card";
import { CardType } from "../baccarat";
import Styles from "./result-baccarat-card.module.scss";

interface StaticBaccaratCardProps {
    card: CardType;
    className?: string;
}

export const ResultStaticBaccaratCard: React.FC<StaticBaccaratCardProps> = ({
    card,
    className
}) => {
    return (
        <div className={`${Styles.card} ${className || ''}`}>
            <div className={Styles["rotate-card"]}>
                <div className={Styles.cardFace}>
                    <div className={Styles["card-front"]}>
                        <Card
                            result={card}
                            customClassName="card-baccarat"
                            viewMode="history"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}; 