import { sentryManager } from '../../../sentry';
import { handle, observer } from '@sg/sg-observer';
import { PureComponent } from 'react';
import Styles from './timeout.module.scss';
import Loading from '../loading';
import * as gc from '@sg/sg-game-client';

interface SessionTimeoutProps {
    token: string;
    renewToken: () => void;
    username: string;
    language: string;
}

interface SessionTimeoutState {
    retryCount: number;
}

@observer
class SessionTimeout extends PureComponent<SessionTimeoutProps, SessionTimeoutState> {
    private retryInterval?: NodeJS.Timeout;
    constructor(props: SessionTimeoutProps) {
        super(props);
        this.state = {
            retryCount: 0,
        };
    }

    componentDidMount(): void {
        this.clearRecheckInInterval();
        this.tryToRenewToken();
    }

    componentWillUnmount(): void {
        this.clearRenewTokenInterval();
    }

    @handle(gc.Auth.AuthHandlers.ClearRecheckInInterval)
    clearRecheckInInterval(): void {
        // Handler for clearing recheck interval
    }

    clearRenewTokenInterval() {
        this.retryInterval && clearInterval(this.retryInterval);
    }

    renewToken() {
        const { retryCount } = this.state;
        if (retryCount >= 3) {
            this.clearRenewTokenInterval();
            sentryManager.logError(`Live Page: Can not renew token for user: ${this.props.username}, expired token: ${this.props.token}`, {
                component: 'SessionTimeout',
                action: 'renewToken',
                username: this.props.username,
                retryCount,
            });
            return;
        }
        this.props.renewToken();
        this.setState({ retryCount: retryCount + 1 });
    }

    tryToRenewToken() {
        this.retryInterval = setInterval(() => {
            this.renewToken();
        }, 1000 * 60);
        this.renewToken();
    }

    render() {
        const { retryCount } = this.state;
        return (
            <div className={Styles['container']}>
                {retryCount < 3 ? (
                    <Loading />
                ) : (
                    <div className={Styles['text']}>{gc.Translator.commonTranslate('message_session_expired')}</div>
                )}
            </div>
        );
    }
}

export default SessionTimeout;
