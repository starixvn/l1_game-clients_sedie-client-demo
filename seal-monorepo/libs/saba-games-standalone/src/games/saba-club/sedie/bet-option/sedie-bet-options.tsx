import * as gc from '@sg/sg-game-client';
import BetOptions, { IBetOptionsState } from '../../../../_shared/components/bet-option';
import BettingBlock from '../../../../_shared/components/bet-option/betting-block';
import OddsComponent from '../../../../_shared/components/bet-option/odd-component';
import OwnBet from '../../../../_shared/components/bet-option/own-bet';
import TotalBet from '../../../../_shared/components/bet-option/total-bet';
import { RoundDot } from '../../../../_shared/components/dot';
import Styles from '../sedie.module.scss';
import { bottomChoices, ChoiceSeDieIconMapper, SeDieChoices, topChoices } from '../type';

// TODO: move to constant
export default class SeDieBetOptions extends BetOptions {
    protected renderDots(dots: boolean[]) {
        return dots.map((isRed, index) => <RoundDot key={index} choice={isRed ? SeDieChoices.odd : SeDieChoices.even} size="small" />);
    }

    renderSubOptions(betChoice: string, odd: number, fractional: boolean, name: string = '', isBoostedChoice: boolean = false) {
        const { settlementResult } = this.state;
        return (
            <BettingBlock
                odd={odd}
                betChoice={betChoice}
                // SeDie / VIP SeDie shared gameName so from page props
                gameName={this.props.gameName}
                namespace={this.props.namespace}
                settlementResult={settlementResult}
                onBet={this.props.onBet}
            >
                <div className={`${Styles['container-bets']} ${Styles['padding-bet']}`}>
                    <div className={`${Styles['wrapper-dots']} ${Styles['wrapper-dots-small']}`}>
                        {this.renderDots(ChoiceSeDieIconMapper[betChoice])}
                    </div>
                    <OddsComponent value={odd} fractional={false} isBoostedChoice={isBoostedChoice} />
                </div>
            </BettingBlock>
        );
    }

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

    renderTotalBet(choice: string) {
        return <TotalBet value={this.state?.totalBets?.[choice]} choice={choice} />;
    }

    renderOwnBet(choice: string) {
        return <OwnBet value={this.state?.ownBets?.[choice]} choice={choice} />;
    }

    isBoostedChoice = (choice: string, boostedChoices: string[] | null) => {
        if (!boostedChoices) {
            return false;
        }
        return boostedChoices.includes(choice);
    };

    render() {
        const { roundOdds, boostedOdds } = this.state as IBetOptionsState;
        const odds = boostedOdds ? boostedOdds.values : roundOdds?.odds;
        const boostedChoices = boostedOdds ? boostedOdds.boostedChoices : roundOdds?.boostedChoices;
        const fractional = roundOdds?.fractional;

        const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });
        const oddOptionName = t('SeDie.glossary_odd');
        const evenOptionName = t('SeDie.glossary_even');

        return (
            <div className={Styles['bet-options-wrapper']}>
                <div className={Styles['bet-options-container-left']}>
                    <div className={`${Styles['bet']} ${Styles['bets-bg']}`}>
                        {this.renderMainOption(oddOptionName, odds?.odd, 'odd', fractional, this.isBoostedChoice('odd', boostedChoices))}
                    </div>
                    <div className={`${Styles['bet']} ${Styles['bets-bg']}`}>
                        {this.renderMainOption(
                            evenOptionName,
                            odds?.even,
                            'even',
                            fractional,
                            this.isBoostedChoice('even', boostedChoices),
                        )}
                    </div>
                </div>
                <div className={Styles['bet-options-container-right']}>
                    {Object.keys(SeDieChoices).map((choiceKey) => {
                        if (topChoices.includes(choiceKey)) {
                            const choiceName = SeDieChoices[choiceKey as keyof typeof SeDieChoices];
                            const odd = odds?.[choiceName] || 0;

                            return (
                                <div className={`${Styles['bets-bg']}`} key={choiceKey}>
                                    {this.renderSubOptions(
                                        choiceKey,
                                        odd,
                                        fractional,
                                        '',
                                        this.isBoostedChoice(choiceName, boostedChoices),
                                    )}
                                </div>
                            );
                        }
                    })}
                    {Object.keys(SeDieChoices).map((choiceKey) => {
                        if (bottomChoices.includes(choiceKey)) {
                            const choiceName = SeDieChoices[choiceKey as keyof typeof SeDieChoices];
                            const odd = odds?.[choiceName] || 0;

                            return (
                                <div className={`${Styles['bets-bg']}`} key={choiceKey}>
                                    {this.renderSubOptions(
                                        choiceKey,
                                        odd,
                                        fractional,
                                        '',
                                        this.isBoostedChoice(choiceName, boostedChoices),
                                    )}
                                </div>
                            );
                        }
                    })}
                </div>
            </div>
        );
    }
}
