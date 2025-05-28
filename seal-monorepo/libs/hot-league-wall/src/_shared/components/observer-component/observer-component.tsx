import { useObserver } from '@sg/sg-observer';
import React from 'react';

export interface IPropsObserver {
    namespace: string;
    language?: string;
    isShowBetSlip?: boolean;
}
export interface IStateObserver {
    dispose: (() => void) | null;
}

export class ObserverComponent<P extends IPropsObserver, S extends IStateObserver> extends React.PureComponent<P, S> {
    constructor(props: P) {
        super(props);
        this.state = {
            dispose: null,
        } as S;
    }

    componentDidMount(): void {
        const { namespace } = this.props;

        if (!namespace) {
            return;
        }

        try {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const dispose = useObserver(this, namespace);
            if (!dispose) {
                throw new Error('Observer registration failed - no dispose function returned');
            }
            this.setState({ dispose });
        } catch (error) {
            // Attempt to recover by retrying once after a short delay
            setTimeout(() => {
                try {
                    const dispose = useObserver(this, namespace);
                    if (namespace) {
                        this.setState({ dispose });
                    }
                } catch (retryError) {
                    // Silent fail on retry
                }
            }, 100);
        }
    }

    componentWillUnmount(): void {
        const { dispose } = this.state;
        if (dispose) {
            try {
                dispose();
            } catch (error) {
                // Silent fail on cleanup
            }
        }
    }

    render() {
        return <></>;
    }
}
