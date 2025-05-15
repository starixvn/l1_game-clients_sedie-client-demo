import { ColorGameChoices } from '../type';
import { BaseBetPercentagesProps, BaseBetPercentageItemProps } from '../../../../_shared/types/bet-percentages';
import { BetResultType, BetCountsType } from '../../../../_shared/types/bet-statistics';

export type BetResult = BetResultType<ColorGameChoices>;
export type BetCounts = BetCountsType<ColorGameChoices>;

export type BetPercentagesProps = BaseBetPercentagesProps;
export type BetPercentageItemProps = BaseBetPercentageItemProps<ColorGameChoices>; 