import * as gc from '@sg/sg-game-client';
import { observer } from '@sg/sg-observer';

import BetOptions from '../../../../_shared/components/bet-option';
import BettingBlock from '../../../../_shared/components/bet-option/betting-block';
import Odds from '../../../../_shared/components/bet-option/odd-component';
import { IPropsObserver } from '../../../../_shared/components/observer-component/observer-component';
import { setting } from '../game-settings';
import { IBaccaratBet } from '../type';
import styles from './baccarat-bet-options.module.scss';

interface IBaccaratBetOptionsProps extends IPropsObserver {
    previousWinningBet?: IBaccaratBet['type'];
    language: string;
    gameName: string;
    onBet: () => void;
}

interface BetOptionProps {
    odd: number;
    betChoice: IBaccaratBet['type'];
    name: string;
    fractional: boolean;
    isBoostedChoice: boolean;
    isWinningBet?: boolean;
}

@observer(setting.mainObserverNamespace)
export default class BaccaratBetOptions extends BetOptions {
    props!: IBaccaratBetOptionsProps;

    constructor(props: IBaccaratBetOptionsProps) {
        super(props);
    }

    componentDidMount() {
        super.componentDidMount();
    }

    private renderBetOptionContent({ odd, name, fractional, isBoostedChoice }: BetOptionProps) {
        return (
            <div className={styles['bet-container']}>
                <div className={styles['bet-name']}>{name}</div>
                <div className={styles['bet-odd']}>
                    <Odds value={odd} fractional={fractional} isBoostedChoice={isBoostedChoice} />
                </div>
            </div>
        );
    }

    private renderBetOption(props: BetOptionProps) {
        const { odd, betChoice } = props;
        const { settlementResult } = this.state;

        return (
            <BettingBlock
                odd={odd}
                betChoice={betChoice}
                namespace={this.props.namespace}
                gameName={this.props.gameName}
                settlementResult={settlementResult}
                onBet={this.props.onBet}
            >
                {this.renderBetOptionContent(props)}
            </BettingBlock>
        );
    }

    public renderTotalBet(choice: string) {
        return <></>;
    }

    public renderOwnBet(choice: string) {
        return <></>;
    }

    private isBoostedChoice(choice: string, boostedChoices: string[] | undefined): boolean {
        return boostedChoices ? boostedChoices.includes(choice) : false;
    }

    render() {
        const { roundOdds, boostedOdds } = this.state;
        const odds = roundOdds?.odds || {};
        const boostedChoices = roundOdds?.boostedChoices;
        const fractional = roundOdds?.fractional;

        return (
            <div className={`${styles['bet-options-wrapper']}`}>
                <div className={styles['main-bets-container']}>
                    <div className={`${styles['bet-option']} `}>
                        {this.renderBetOption({
                            name: gc.Translator.t('Baccarat.glossary_player'),
                            odd: odds?.player,
                            betChoice: 'player',
                            fractional: !!fractional,
                            isBoostedChoice: this.isBoostedChoice('player', boostedChoices),
                        })}
                        {this.renderTotalBet('player')}
                        {this.renderOwnBet('player')}
                    </div>
                    <div className={`${styles['bet-option']} `}>
                        {this.renderBetOption({
                            name: gc.Translator.t('Baccarat.glossary_banker'),
                            odd: odds?.banker,
                            betChoice: 'banker',
                            fractional: !!fractional,
                            isBoostedChoice: this.isBoostedChoice('banker', boostedChoices),
                        })}
                        {this.renderTotalBet('banker')}
                        {this.renderOwnBet('banker')}
                    </div>
                </div>
                <div className={styles['tie-container']}>
                    <div className={`${styles['bet-option']} `}>
                        {this.renderBetOption({
                            name: gc.Translator.t('Baccarat.glossary_tie'),
                            odd: odds?.tie,
                            betChoice: 'tie',
                            fractional: !!fractional,
                            isBoostedChoice: this.isBoostedChoice('tie', boostedChoices),
                        })}
                        {this.renderTotalBet('tie')}
                        {this.renderOwnBet('tie')}
                    </div>
                </div>
                <div className={styles['pair-container']}>
                    <div className={`${styles['bet-option']} `}>
                        {this.renderBetOption({
                            name: gc.Translator.t('Baccarat.glossary_playerPair'),
                            odd: odds?.playerPair,
                            betChoice: 'playerPair',
                            fractional: !!fractional,
                            isBoostedChoice: this.isBoostedChoice('playerPair', boostedChoices),
                        })}
                        {this.renderTotalBet('playerPair')}
                        {this.renderOwnBet('playerPair')}
                    </div>
                    <div className={`${styles['bet-option']} }`}>
                        {this.renderBetOption({
                            name: gc.Translator.t('Baccarat.glossary_bankerPair'),
                            odd: odds?.bankerPair,
                            betChoice: 'bankerPair',
                            fractional: !!fractional,
                            isBoostedChoice: this.isBoostedChoice('bankerPair', boostedChoices),
                        })}
                        {this.renderTotalBet('bankerPair')}
                        {this.renderOwnBet('bankerPair')}
                    </div>
                </div>
            </div>
        );
    }
}
