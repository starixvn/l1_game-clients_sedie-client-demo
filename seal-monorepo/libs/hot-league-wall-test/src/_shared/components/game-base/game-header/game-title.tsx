import * as gc from "@sg/sg-game-client";
import React from "react";
import styles from "./game-header.module.scss";
import { getGameSetting } from "../../../app-settings";
import classNames from "classnames";

export interface GameTitleProps {
    gameId: number;
    arrowProps?: {
        className?: string;
        onClick?: (e: React.MouseEvent) => void;
    };
}

export const GameTitle: React.FC<GameTitleProps> = ({ gameId, arrowProps }) => {
    const gameSetting = getGameSetting(gameId);
    const gameName = gc.Translator.t(`${gameSetting?.gameName}.game_name`);

    return (
        <div className={styles["title-with-icon"]}>
            <div
                className={classNames(styles["collapse-btn"])}
                {...arrowProps}
            >
                <div className={styles["collapse-icon"]}></div>
            </div>
            <span className={styles.divider} />
            <div className={styles[`game-icon-${gameId}`]} />
            <div>{gameName}</div>
        </div>
    );
};

export default GameTitle; 