import * as gc from '@sg/sg-game-client';
import { render } from '@sg/sg-observer';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../../../_shared/components/observer-component/observer-component';
import classNames from "classnames";
import styles from './header.module.scss';
import { ColorGameOddsType } from './type';

interface IColorGameHeaderProps extends IPropsObserver {
    isExpanded: boolean;
    handleToggle: () => void;
    language: string;
}

interface IColorGameHeaderState extends IStateObserver {
    roundOdds: gc.Rounds.RoundOdds;
    dispose: (() => void) | null;
}

export class ColorGameHeader extends ObserverComponent<IColorGameHeaderProps, IColorGameHeaderState> {
    constructor(props: IColorGameHeaderProps) {
        super(props);
        this.state = {
            roundOdds: {} as gc.Rounds.RoundOdds,
            dispose: null
        };
    }

    @render(gc.Rounds.RoundStore, (store) => store.roundOdds, { fireImmediately: true })
    setOdds(roundOdds: gc.Rounds.RoundOdds) {
        this.setState({ roundOdds });
    }

    render() {
        const { isExpanded, handleToggle } = this.props;
        const { roundOdds } = this.state;
        const odds = roundOdds?.odds || {};
        const doubleOdds = odds?.[ColorGameOddsType.double]?.toFixed(2) || '-';
        const tripleOdds = odds?.[ColorGameOddsType.triple]?.toFixed(2) || '-';
        const gameName = gc.Translator.translate('ColorGame.game_name');

        const gameTypeDouble = gc.Translator.translate('ColorGame.choices_type_double')
            .replace('{odds_double}', doubleOdds);

        const gameTypeTriple = gc.Translator.translate('ColorGame.choices_type_triple')
            .replace('{odds_triple}', tripleOdds);

        return (
            <div className={styles['game-title']} onClick={handleToggle}>
                <div className={styles['title-with-icon']}>
                    <div
                        className={classNames(styles['collapse-btn'], {
                            [styles['collapsed']]: !isExpanded,
                        })}
                    >
                        <div className={styles['collapse-icon']}></div>
                    </div>
                    <div className={styles['game-header']}>
                        <div className={styles['game-icon']}></div>
                        <div className={styles['game-name']}>{gameName}</div>
                    </div>
                </div>

                {isExpanded && (
                    <div className={styles['game-option-container']}>
                        <div >
                            {gc.Translator.translate('ColorGame.bet_choices_type')}
                        </div>
                        <div >
                            -
                        </div>
                        <div className="odds-info-item">
                            {gameTypeDouble}
                        </div>
                        <div className="odds-info-item">
                            {gameTypeTriple}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

// Maintain backward compatibility
export const Header = ColorGameHeader; 