import * as gc from "@sg/sg-game-client";
import classNames from "classnames";

import styles from "./header.module.scss";

export const SieDieHeader = ({ isExpanded, handleToggle }) => {
    const gameName = gc.Translator.translate('SeDie.game_name');
    const oddsEven = gc.Translator.translate('SeDie.choices_type1');
    const redWhite = gc.Translator.translate('SeDie.choices_type2');

    return (
        <div className={styles['game-title']} onClick={handleToggle}>
            <div className={styles['title-with-icon']}>
                <div
                    className={classNames(styles['collapse-btn'], {
                        [styles['collapsed']]: !isExpanded,
                    })}
                >
                    <div className={styles['collapse-icon']}></div>
                </div>
                <div className={styles['game-header']}>
                    <div className={styles['game-icon']}></div>
                    <div className={styles['game-name']}>{gameName}</div>
                </div>
            </div>

            {isExpanded && (
                <div className={styles['game-option-container']}>
                    <span className={`${styles['game-option']} ${styles['game-option-even']}`}>{oddsEven}</span>
                    <span className={`${styles['game-option']} ${styles['game-option-red-white']}`}>{redWhite}</span>
                </div>
            )}
        </div>
    );
};
