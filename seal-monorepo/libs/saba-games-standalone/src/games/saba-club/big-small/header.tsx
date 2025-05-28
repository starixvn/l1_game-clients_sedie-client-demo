import * as gc from '@sg/sg-game-client';
import styles from './header.module.scss';
import classNames from 'classnames';

export const BigSmallHeader = ({ isExpanded, handleToggle }) => {
    const gameName = gc.Translator.translate('UnbalancedBigSmall4.game_name');
    const bigSmall = gc.Translator.translate('UnbalancedBigSmall4.choices_type');

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
                    <span className={styles['game-option']}>{bigSmall}</span>
                </div>
            )}
        </div>
    );
};

