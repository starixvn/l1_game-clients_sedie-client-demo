import * as gc from '@sg/sg-game-client';
import { BaccaratDot } from '../dot/baccarat-dot';
import Styles from './baccarat-round-history.module.scss';
import { Choices } from '../baccarat-helper';
import Tooltip from '../../../../_shared/components/tooltip/tooltip';

interface TooltipProps {
    roundId: number;
    winningChoice: string;
    playerPoints: number;
    bankerPoints: number;
}

export const BaccaratRoundHistoryTooltip: React.FC<TooltipProps> = ({
    roundId,
    winningChoice,
    playerPoints,
    bankerPoints
}) => {
    const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });

    return (
        <Tooltip className={Styles['tooltip']} roundId={roundId}>
            <span>{t(`Baccarat.glossary_${Choices.player}`).toUpperCase()}: {playerPoints}</span>
            <span className={Styles['separator']}>-</span>
            <span>{t(`Baccarat.glossary_${Choices.banker}`).toUpperCase()}: {bankerPoints}</span>
        </Tooltip>
    );
}; 