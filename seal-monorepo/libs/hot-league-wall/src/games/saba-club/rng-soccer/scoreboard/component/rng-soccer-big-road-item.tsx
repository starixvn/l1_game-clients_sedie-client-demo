import React from 'react';
import styles from '../rng-soccer-scoreboard.module.scss';
// Image assets
import homeDotImage from '../../../../../assets/rng-soccer/scoreboard/home.svg';
import awayDotImage from '../../../../../assets/rng-soccer/scoreboard/away.svg';
import drawDotImage from '../../../../../assets/rng-soccer/scoreboard/draw.svg';
import { BigRoadScoreboardPoint } from 'sc-scoreboards';
import { RNGSoccerSettlementItemResult } from '../../type';

const scoreboardImages: Record<string, string> = {
    home: homeDotImage,
    away: awayDotImage,
    draw: drawDotImage,
};

const DrawDot: React.FC<{ count: number }> = ({ count }) => (
    <>
        {count >= 2 && <span className={styles['draw-count']}>{count}</span>}
        <img className={styles['draw-image']} src={scoreboardImages.draw} alt="Draw" />
    </>
);

const RNGSoccerBigRoadItem: React.FC<{
    item: BigRoadScoreboardPoint<RNGSoccerSettlementItemResult>;
}> = ({ item }) => {
    const { status, data, isBlink } = item;
    
    if (isBlink) {
        return <div className={styles['dot-blink']}></div>;
    }

    if (status === undefined) {
        return <div className={styles['dot-empty']}></div>;
    }

    if (!data || data.length === 0) {
        return null;
    }

    const firstItem = data[0];
    if (!firstItem ) {
        return null;
    }
    const { draw } = firstItem;
    const imagePath = status ? scoreboardImages.home : scoreboardImages.away;
    const drawCount = draw ? data.length : data.length - 1;

    return (
        <div className={styles['dot-image']}>
            <img src={imagePath}  style={{ width: '14px', height: '14px' }} />
            {drawCount > 0 && <DrawDot count={drawCount} />}
        </div>
    );
};

export default RNGSoccerBigRoadItem;
