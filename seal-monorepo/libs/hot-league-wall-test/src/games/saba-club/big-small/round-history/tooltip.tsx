import * as gc from '@sg/sg-game-client';
import Styles from './big-small-round-history.module.scss';
import Tooltip from '../../../../_shared/components/tooltip/tooltip';

interface TooltipProps {
    roundId: number;
    winner: string;
    diceValues: number[];
}

export const BigSmallRoundHistoryTooltip: React.FC<TooltipProps> = ({
    roundId,
    winner,
    diceValues
}) => {
    const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });
    const total = diceValues.reduce((sum, value) => sum + value, 0);

    return (
        <Tooltip className={Styles['tooltip']} roundId={roundId}>
            <span>{t(`UnbalancedBigSmall4.${winner}`).toUpperCase()} ({diceValues.join('-')})</span>
        </Tooltip>
    );
}; 