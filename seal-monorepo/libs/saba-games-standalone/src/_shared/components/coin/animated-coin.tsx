import React, { useState, useEffect } from 'react';
import { Size } from "../../../_shared/constants";
import styles from "./animated-coin.module.scss"
import { CoinSymbol } from '.';
import { ANIMATION_DURATION_MS } from '../../../games/saba-club/coin-toss/constants/coin-toss-constants';

interface ICoinProps {
      size?: typeof Size.large | typeof Size.medium | typeof Size.small;
      onFlipEnd?: (symbol: CoinSymbol) => void;
      result: CoinSymbol;
}

const AnimatedCoin: React.FC<ICoinProps> = ({
      size = Size.large,
      onFlipEnd,
      result
}) => {
      const [showAnimation, setShowAnimation] = useState(false);

      useEffect(() => {
            setShowAnimation(true)
            const endTimer = setTimeout(() => {
                  if (onFlipEnd) {
                        onFlipEnd(result);
                  }
            }, ANIMATION_DURATION_MS);

            return () => {
                  clearTimeout(endTimer);
            };
      }, [onFlipEnd, result]);

      const flipClass = result === CoinSymbol.HEAD ? 'flipping-head' : 'flipping-tail';

      return (
            <div className={`${styles.coin} ${styles[size]} ${showAnimation ? styles[flipClass] : ''}`}>
                  <div className={styles['front']}></div>
                  <div className={styles['back']}></div>
                  <div className={styles['side']}>
                         {Array(16).fill(1).map((_, key) =>  <div className={styles['spoke']}></div>)}
                  </div>
            </div>
      )
}

export default AnimatedCoin;