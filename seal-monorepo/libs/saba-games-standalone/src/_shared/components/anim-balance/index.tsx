import * as gc from "@sg/sg-game-client";
import { useEffect } from 'react';
import { SyncMemberSiteBalance } from '../../utils/sync-member-site-balance';
import style from './balance.module.scss';

const AnimationBalance = ({ winBet }) => {
    useEffect(() => {
        SyncMemberSiteBalance.getInstance().executeSyncBalance(undefined, winBet);
    }, [winBet]);

    return (
        <div className={style['win-amount']}>
            {`+${gc.FormatUtils.numberWithCommas(winBet, 2)}`}
        </div>
    );
};

export default AnimationBalance;
