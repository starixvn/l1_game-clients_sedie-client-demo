import BetOptions, { IBetOptionsState } from '../../../../_shared/components/bet-option';
import BettingBlock from '../../../../_shared/components/bet-option/betting-block';
import OwnBet from '../../../../_shared/components/bet-option/own-bet';
import TotalBet from '../../../../_shared/components/bet-option/total-bet';
import Styles from './big-small-bet-options.module.scss';
import { BigSmallChoices } from '../type';
import * as gc from '@sg/sg-game-client';
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds';
import { IPropsObserver } from '../../../../_shared/components/observer-component/observer-component';
import { observer } from '@sg/sg-observer';
import { setting } from '../game-settings';
import OddsComponent from '../../../../_shared/components/bet-option/odd-component';

interface BetOptionProps {
    odd: number;
    betChoice: string;
    name?: string;
    fractional: boolean;
    isBoostedChoice: boolean;
    onBet: () => void;
}

@observer(setting.mainObserverNamespace)
export default class BigSmallBetOptions extends BetOptions {
    renderMainOption(name: string, odd: number, betChoice: string, fractional: boolean, isBoostedChoice: boolean = false) {
        const { settlementResult } = this.state;
        return (
            <BettingBlock
                odd={odd}
                betChoice={betChoice}
                gameName={this.props.gameName}
                namespace={this.props.namespace}
                settlementResult={settlementResult}
                onBet={this.props.onBet}
            >
                <div className={`${Styles['container-bets']} ${Styles['padding-bet']}`}>
                    <div>
                        <div className={Styles['main-option']}>{name}</div>
                    </div>
                    <div>
                        <OddsComponent value={odd} fractional={false} isBoostedChoice={isBoostedChoice} />
                    </div>
                </div>
            </BettingBlock>
        );
    }

    public renderTotalBet(choice: string) {
        return <TotalBet value={this.state?.totalBets?.[choice]} choice={choice} />;
    }

    public renderOwnBet(choice: string) {
        return <OwnBet value={this.state?.ownBets?.[choice]} choice={choice} />;
    }

    private isBoostedChoice(choice: string, boostedChoices: string[] | undefined): boolean {
        return boostedChoices ? boostedChoices.includes(choice) : false;
    }

    render() {
        const { roundOdds, boostedOdds } = this.state as IBetOptionsState;
        const odds = boostedOdds?.values || roundOdds?.odds;
        const boostedChoices = boostedOdds?.boostedChoices || roundOdds?.boostedChoices;
        const fractional = roundOdds?.fractional;

        const t = (key) =>
            gc.Translator.translate(key, {
                languageId: gc.Translator.getCurrentLanguageId(),
            });
        const bigOptionName = t('UnbalancedBigSmall4.big') + ' [11 - 18]';
        const smallOptionName = t('UnbalancedBigSmall4.small') + ' [3 - 10]';

        return (
            <div className={`${Styles['bet-options-wrapper']}`}>
                <div className={Styles['main-options-container']}>
                    <div className={`${Styles['bet']} ${Styles['bets-bg']} `}>
                        {this.renderMainOption(
                            bigOptionName,
                            odds?.big || 0,
                            BigSmallChoices.big,
                            !!fractional,
                            this.isBoostedChoice(BigSmallChoices.big, boostedChoices),
                        )}
                    </div>
                    <div className={`${Styles['bet']} ${Styles['bets-bg']} `}>
                        {this.renderMainOption(
                            smallOptionName,
                            odds?.small || 0,
                            BigSmallChoices.small,
                            !!fractional,
                            this.isBoostedChoice(BigSmallChoices.small, boostedChoices),
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
