import Styles from './big-small-dot.module.scss';
import classNames from 'classnames';

type Props = {
    choice?: string;
    row?: number;
    col?: number;
    value?: number | string | object;
    highlight?: boolean;
    size?: string;
    gameName?: string;
};

const BigSmallRoundDot: React.FC<any> = ({
    choice = 'even',
    value,
    highlight = false,
    size = '',
    gameName,
}) => {
    const classDotName = `dot-${choice}`;
    return (
        <div
            className={classNames(
                Styles[classDotName],
                Styles[size]
                // gameName && Styles[gameName]
            )}
            data-testid='round-dot'
        >
            {value}
        </div>
    );
};

export default BigSmallRoundDot;
