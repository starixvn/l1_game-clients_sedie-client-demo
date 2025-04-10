import * as gc from "@sg/sg-game-client";
import style from './balance.module.scss';

const AnimationBalance = ({ winBet }) => {
    return (
        <div className={style['win-amount']}>
            {`+${gc.FormatUtils.numberWithCommas(winBet, 2)}`}
        </div>
    );
};

export default AnimationBalance;
