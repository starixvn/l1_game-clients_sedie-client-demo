import styles from './baccarat-scoreboard.module.scss';
// Image assets
import playerDotImage from '../../../../assets/baccarat/scoreboard/big-road/player.svg';
import bankerDotImage from '../../../../assets/baccarat/scoreboard/big-road/banker.svg';
import playerPairDotImage from '../../../../assets/baccarat/scoreboard/big-road/player-pair-dot.svg';
import bankerPairDotImage from '../../../../assets/baccarat/scoreboard/big-road/banker-pair-dot.svg';
import naturalImage from '../../../../assets/baccarat/scoreboard/big-road/natural.svg';
import tieImage from '../../../../assets/baccarat/scoreboard/big-road/tie.svg';
import { BigRoadScoreboardPoint } from 'sc-scoreboards';
import { BaccaratSettlementResult } from '../type';

const scoreboardImages: Record<string, string> = {
    player: playerDotImage,
    banker: bankerDotImage,
    playerPair: playerPairDotImage,
    bankerPair: bankerPairDotImage,
    natural: naturalImage,
    tie: tieImage,
};

const TieDot: React.FC<{ count: number }> = ({ count }) => (
    <>
        {count >= 2 && <span className={styles['tie-count']}>{count}</span>}
        <img className={styles['tie-image']} src={scoreboardImages.tie} alt="Tie" />
    </>
);

const BaccaratBigRoadItem: React.FC<{
    item: BigRoadScoreboardPoint<BaccaratSettlementResult>;
}> = ({ item }) => {
    const { status, data, isBlink } = item;
    if (isBlink) {
        return <div className={styles['dot-blink']}></div>;
    }

    if (status === undefined) {
        return <div className={styles['dot-empty']}></div>;
    }

    const imagePath = status ? scoreboardImages.banker : scoreboardImages.player;
    const natural = data?.some((result) => result.natural);
    const playerPair = data?.some((result) => result.playerPair);
    const bankerPair = data?.some((result) => result.bankerPair);
    const tieCount = data?.[0]?.tie ? data.length : data.length - 1;

    return (
        <div className={styles['dot-image']}>
            <img src={imagePath} alt={status ? 'Banker' : 'Player'} />
            {natural && (
                <img
                    className={styles['natural-image']}
                    src={scoreboardImages.natural}
                    style={{ width: '16px', height: '16px' }}
                    alt="Natural"
                />
            )}
            {playerPair && (
                <img className={`${styles['pair-dot']} ${styles['player-pair']}`} src={scoreboardImages.playerPair} alt="Pair" />
            )}
            {bankerPair && (
                <img className={`${styles['pair-dot']} ${styles['banker-pair']}`} src={scoreboardImages.bankerPair} alt="Pair" />
            )}
            {tieCount > 0 && <TieDot count={tieCount} />}
        </div>
    );
};

export default BaccaratBigRoadItem;
