import styles from '../rng-soccer.module.scss';
import closeIcon from '../../../../assets/rng-soccer/close.svg';
import { RNGSoccerScoreboard } from '../scoreboard/rng-soccer-scoreboard';

interface RNGSoccerStatisticProps {
    namespace: string;
    language: string;
    isPopupVisible: boolean;
    togglePopup: () => void;
}

export default function RNGSoccerStatistic({ namespace, language, isPopupVisible, togglePopup }: RNGSoccerStatisticProps) {
    console.log('🟢 RNGSoccerStatistic: Component rendered with props:', { namespace, language, isPopupVisible });

    return (
        <div className={`${styles['wrapper-popup']} ${isPopupVisible ? styles['active'] : ''}`}>
            <div className={styles['close-popup']} onClick={() => {
                console.log('🟢 RNGSoccerStatistic: Close button clicked');
                togglePopup();
            }}>
                <img src={closeIcon} alt="close" className={styles['close-icon']} />
            </div>
            <RNGSoccerScoreboard gameName={namespace} language={language} namespace={namespace} />
        </div>
    );
} 