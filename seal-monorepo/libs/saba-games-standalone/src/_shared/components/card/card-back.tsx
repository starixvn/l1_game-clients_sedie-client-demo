import React from "react";
import cardBack from "../../../assets/cards/card-back.svg";
import Styles from "./card.module.scss";

const CardBack: React.FC = () => {
    return (
        <div className={`${Styles["card-back"]} ${Styles["card"]}`}>
            <div className={Styles["result"]} data-testid="card-back">
                <img
                    src={cardBack}
                    className={Styles["card-suite"]}
                    height={80}
                    width={56}
                    alt="card back"
                />
            </div>
        </div>
    );
};

export default CardBack; 