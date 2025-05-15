import * as gc from '@sg/sg-game-client';
import classNames from 'classnames';
import styles from './header.module.scss';

interface GameHeaderProps {
    isExpanded: boolean;
    handleToggle: () => void;
}

const GameHeader = ({ isExpanded, handleToggle }: GameHeaderProps) => {
    // Use translator for internationalization
    const gameName = gc.Translator.translate('CoinToss.game_name');
    const gameOptions = gc.Translator.translate('CoinToss.choices_type');

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
                    <span className={styles['game-option']}>{gameOptions}</span>
                </div>
            )}
        </div>
    );
};

export default GameHeader;