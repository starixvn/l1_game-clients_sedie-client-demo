import * as gc from "@sg/sg-game-client";
import { useEffect } from 'react';
import { SyncMemberSiteBalance } from '../../utils/sync-member-site-balance';
import style from './Success.module.scss';

const BetModalSuccess = ({ totalStake }) => {
    useEffect(() => {
        SyncMemberSiteBalance.getInstance().executeSyncBalance(totalStake);
    }, [totalStake]);

    return (
        <div className={style['stake-container']}>
            <span className={style['stake']}>{`-${gc.FormatUtils.numberWithCommas(totalStake)}`}</span>
        </div>
    );
};

export default BetModalSuccess;
