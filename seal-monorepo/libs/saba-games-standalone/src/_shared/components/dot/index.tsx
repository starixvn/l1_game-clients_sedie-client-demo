import Styles from './dot.module.scss';

type Props = {
    choice?: string;
    value?: number | string;
    highlight?: boolean;
    size?: string;
    gameName?: string;
    classNameStyle?: string;
};

export const RoundDot: React.FunctionComponent<Props> = ({
    choice = 'even',
    value,
    highlight = false,
    size = '',
    gameName,
    classNameStyle,
}) => {
    const classDotName = `dot-${choice}`;
    return (
        <div
            className={`${Styles[classDotName]} ${highlight ? Styles['highlight-current-result'] : ''} ${Styles[size]}  ${
                gameName ? Styles[gameName] : ''
            } ${classNameStyle}`}
            data-testid="round-dot"
        >
            {value}
        </div>
    );
};
