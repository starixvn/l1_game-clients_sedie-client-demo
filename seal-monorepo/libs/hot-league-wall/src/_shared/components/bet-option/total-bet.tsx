import Styles from './bet-option.module.scss';

export interface TotalBetPros {
    choice: string;
    value: any;
}

export const TotalBet: React.FC<TotalBetPros> = ({ choice, value }) => {
    if (value <= 0) {
        return <></>;
    }

    return <div className={`${choice} ${Styles['total-stakes']}`}>{value}</div>;
};
export default TotalBet;
