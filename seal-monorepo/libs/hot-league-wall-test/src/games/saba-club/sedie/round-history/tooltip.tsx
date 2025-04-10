import * as gc from '@sg/sg-game-client';
import { RoundDot } from '../../../../_shared/components/dot';
import Styles from '../sedie.module.scss';
import { SeDieChoices } from '../type';
import Tooltip from '../../../../_shared/components/tooltip/tooltip';

interface TooltipProps {
    roundId: number;
    choice: string;
    countRed: number;
    dotsTotal: number;
}

export const RoundHistoryTooltip: React.FC<TooltipProps> = ({ roundId, choice, countRed, dotsTotal }) => {
    const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });

    return (
        <Tooltip className={Styles['tooltip']} roundId={roundId}>
            {t(`SeDie.glossary_${choice.toLowerCase()}`).toUpperCase()}
            {' '}
            <RoundDot choice={SeDieChoices.odd} size="small" />
            {countRed}
            <RoundDot choice={SeDieChoices.even} size="small" />
            {dotsTotal - countRed}
        </Tooltip>
    );
}; 