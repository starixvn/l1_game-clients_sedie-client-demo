import { RoundDot } from '../../../../_shared/components/dot';
import Styles from './baccarat-dot.module.scss';

type Props = {
    choice?: string;
    value?: number | string;
    highlight?: boolean;
    size?: string;
    gameName?: string;
    classNameStyle?: string;
};
export const BaccaratDot: React.FC<Props> = ({ choice, value, highlight, size, gameName, classNameStyle }) => {
    const classDotName = Styles[`dot-${choice}`];
    const props = {
        choice,
        value,
        highlight,
        size,
        gameName,
        classNameStyle: `${classDotName} ${classNameStyle}`,
    };
    return <RoundDot {...props} />;
};
