import * as gc from '@sg/sg-game-client';
import { render } from '@sg/sg-observer';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../observer-component/observer-component';
import Styles from './notices.module.scss';
import WarningDialog from './warning-dialog';

export interface IWarningState extends IStateObserver {
    warnings: gc.Notices.Warning[];
    processingWarnings: gc.Notices.Warning[];
    isProcessingBet: boolean;
}

const AUTO_HIDE_DURATION = 3000;

export default class Warning extends ObserverComponent<IPropsObserver, IWarningState> {
    private timeoutIds: Map<gc.Notices.Warning, NodeJS.Timeout> = new Map();
    constructor(props: IPropsObserver) {
        super(props);
        this.state = {
            dispose: null,
            warnings: [],
            processingWarnings: [],
            isProcessingBet: false,
        } as IWarningState;
    }

    componentWillUnmount() {
        this.clearAllTimeouts();
    }

    @render(gc.Notices.NoticeStore, (store) => store.warning, { fireImmediately: false })
    setNotice(warning: gc.Notices.Warning) {
        this.addWarning(warning);
    }

    @render(gc.Notices.NoticeStore, (store) => store.processingWarning, { fireImmediately: false })
    showProcessingWarning(processingWarning: gc.Notices.Warning) {
        console.log(`showProcessingWarning ${processingWarning}`);
        this.addProcessingWarning(processingWarning);
    }

    @render(gc.Bet.BetStore, (store) => store.isProcessingBet, { fireImmediately: false })
    hideProcessingWarning(isProcessingBet: boolean) {
        if (!isProcessingBet) {
            this.setState({ processingWarnings: [] });
        }
    }

    addWarning(warning: gc.Notices.Warning) {
        this.setState(
            (prevState) => ({
                warnings: [...prevState.warnings, warning],
            }),
            () => this.scheduleRemoval('warnings', warning),
        );
    }

    addProcessingWarning(processingWarning: gc.Notices.Warning) {
        this.setState(
            (prevState) => ({
                processingWarnings: [...prevState.processingWarnings, processingWarning],
            }),
            () => this.scheduleRemoval('processingWarnings', processingWarning),
        );
    }

    scheduleRemoval(arrayName: 'warnings' | 'processingWarnings', item: gc.Notices.Warning) {
        const timeoutId = setTimeout(() => {
            this.setState((prevState) => {
                const newState = {
                    ...prevState,
                };

                newState[arrayName] = prevState[arrayName].filter((warning) => warning !== item);

                return newState;
            });
        }, AUTO_HIDE_DURATION);

        this.timeoutIds.set(item, timeoutId);
    }

    clearAllTimeouts() {
        this.timeoutIds.forEach((id) => clearTimeout(id));
        this.timeoutIds.clear();
    }

    render() {
        const { warnings, processingWarnings } = this.state;

        return (
            <>
                {warnings.map((warning, index) => (
                    <WarningDialog key={`warning-${index}`} {...warning}>
                        <div className={Styles['title-white']}>{warning?.message}</div>
                    </WarningDialog>
                ))}

                {processingWarnings.map((processingWarning, index) => (
                    <WarningDialog key={`processingWarning-${index}`} {...processingWarning}>
                        <div className={Styles['title-white']}>{processingWarning?.message}</div>
                    </WarningDialog>
                ))}
            </>
        );
    }
}
