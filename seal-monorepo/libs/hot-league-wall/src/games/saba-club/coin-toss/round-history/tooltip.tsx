import * as gc from '@sg/sg-game-client';
import Styles from './coin-toss-round-history.module.scss';
import Tooltip from '../../../../_shared/components/tooltip/tooltip';

interface TooltipProps {
    roundId: number;
    winner: string;
}

export const CoinTossRoundHistoryTooltip: React.FC<TooltipProps> = ({
    roundId,
    winner,
}) => {
    const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });

    return (
        <Tooltip className={Styles['tooltip']} roundId={roundId}>
            <span>{t(`CoinToss.glossary_${winner}`).toUpperCase()}</span>
        </Tooltip>
    );
}; 