import React, { useEffect, useRef } from 'react';
import styles from './baccarat-scoreboard.module.scss';
import { BigRoadScoreboardPoint } from 'sc-scoreboards';
import { BaccaratSettlementResult } from '../type';
import BaccaratBigRoadItem from './baccarat-big-road-item';
import ScrollElement from '../../../../_shared/components/scroll-element';

const BaccaratBigRoad: React.FC<{
    maxRows: number;
    rows: BigRoadScoreboardPoint<BaccaratSettlementResult>[][];
}> = ({ maxRows, rows }) => {
    const scrollDivRef = useRef<HTMLDivElement>(null);

    const scrollToRight = () => {
        if (scrollDivRef.current) {
            scrollDivRef.current.scrollLeft = scrollDivRef.current.scrollWidth;
        }
    };

    useEffect(() => {
        scrollToRight();
    }, [rows]);

    return (
        <ScrollElement className={`${styles['scoreboard-content']} baccarat-big-road`} refData={scrollDivRef}>
            <div
                className={styles['grid-container']}
                style={{
                    gridTemplateRows: `repeat(${maxRows}, var(--cell-size))`,
                    gridAutoColumns: 'var(--cell-size)',
                    position: 'relative',
                    zIndex: 2,
                }}
            >
                {rows.map((row, rowIndex) =>
                    row.map((item, colIndex) => (
                        <div
                            className={styles['dot-item']}
                            style={{
                                gridColumnStart: colIndex + 1,
                                gridRowStart: rowIndex + 1,
                            }}
                            key={`${rowIndex}_${colIndex}`}
                        >
                            <BaccaratBigRoadItem item={item} />
                        </div>
                    )),
                )}
            </div>
        </ScrollElement>
    );
};

export default BaccaratBigRoad;
