import classNames from 'classnames';
import Styles from './bet-option.module.scss';

export interface OddPros {
    value: number;
    fractional: boolean;
    namespace?: string;
    choice?: string;
    isBoostedChoice?: boolean;
}

export const OddsComponent: React.FC<OddPros> = ({ 
    value, 
    fractional, 
    isBoostedChoice 
}) => {
    if (!value || isNaN(value) || value <= 0) {
        return null;
    }

    const formattedValue = value.toFixed(2);

    return (
        <div 
            className={classNames(Styles['odd'], {
                [Styles["boosted-odd"]]: isBoostedChoice,
            })}
        >
            {formattedValue}
        </div>
    );
};

export default OddsComponent;
