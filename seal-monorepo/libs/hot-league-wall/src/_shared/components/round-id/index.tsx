import * as gc from '@sg/sg-game-client';
import { RoundStore, RoundTimeStore } from '@sg/sg-game-client/dist/game/rounds';
import { render } from '@sg/sg-observer';
import Styles from '../game-base/game-base.module.scss';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../observer-component/observer-component';

export interface IRoundIdProps extends IPropsObserver {
    language: string;
}

export interface IRoundIdState extends IStateObserver {
    clientRoundId: number;
    roundState: string;
}

export default class RoundId extends ObserverComponent<IRoundIdProps, IRoundIdState> {
    constructor(props: IRoundIdProps) {
        super(props);
        this.state = {
            dispose: null,
            clientRoundId: 0,
            roundState: '',
        };
    }

    @render(RoundTimeStore, (store) => store.roundState, { fireImmediately: false })
    renderRoundState(roundState: string) {
        this.setState({ roundState });
    }

    @render(RoundStore, (store) => store.clientRoundId)
    async renderRoundId(clientRoundId: number) {
        this.setState({
            clientRoundId,
        });
    }

    render() {
        const { clientRoundId, roundState } = this.state;
        if (clientRoundId === 0 || !roundState) return <></>;
        return (
            <div className={Styles['round-id']}>
                {gc.Translator.translate('Common.result_no')} {clientRoundId}
            </div>
        );
    }
}
