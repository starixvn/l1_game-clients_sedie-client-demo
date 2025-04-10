import * as gc from "@sg/sg-game-client";
import style from './Success.module.scss';

const BetModalSuccess = ({totalStake}) => {
    return (
        <div className={style['stake-container']}>
            <span className={style['stake']}>{`-${gc.FormatUtils.numberWithCommas(totalStake)}`}</span>
        </div>
    );
};

export default BetModalSuccess;
