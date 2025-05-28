import { memo } from 'react';
import Styles from './bet-option.module.scss';

export interface OwnBetPros {
    choice: string;
    value: any;
}

export const OwnBet: React.FC<OwnBetPros> = ({ value, choice }) => {
    return <div className={`${choice} ${Styles['own-bet']}`}>{value}</div>;
};

export default memo(OwnBet);
