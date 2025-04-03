import * as gc from '@sg/sg-game-client';
import { render } from '@sg/sg-observer';
import { IPropsObserver, IStateObserver, ObserverComponent } from '../observer-component/observer-component';
import NoticeDialog from './notice-dialog';
import { FunctionUtils } from '../../utils/funtion-utils';
import { NoticeInfo } from '@sg/sg-game-client/dist/game/notices';

export interface INoticeState extends IStateObserver {
    notice: gc.Notices.Notice;
    isShow: boolean;
    language?: string;
}

export interface INoticeProps extends IPropsObserver {
    isDisableGame?: boolean;
    language?: string;
}

export default class Notice extends ObserverComponent<INoticeProps, INoticeState> {
    private timer: NodeJS.Timeout | null = null;
    private readonly AUTO_CLOSE_DELAY = 5000;
    private isJoiningGame = false;

    constructor(props: IPropsObserver) {
        super(props);
        this.state = {
            dispose: null,
            notice: {},
            isShow: false,
        } as INoticeState;
        this.closeNotice = this.closeNotice.bind(this);
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    @render(gc.Connection.ConnectionStore, (store) => store.joinGame)
    handleJoinedGame() {
        this.isJoiningGame = true;
        this.closeNotice();
    }

    @render(gc.Notices.NoticeStore, (store) => store.notice, { fireImmediately: true })
    private setNotice(notice: gc.Notices.Notice) {
        if (notice && notice?.noticeInfo === NoticeInfo.LostGameConnection && this.isJoiningGame) {
            return;
        }

        if (notice) {
            if (this.timer) {
                clearTimeout(this.timer);
            }

            this.setState({ notice, isShow: true });
            !this.props.isDisableGame && (this.timer = setTimeout(this.closeNotice, this.AUTO_CLOSE_DELAY));
        }
    }

    @render(gc.DisabledGame.DisabledGameStore, (store) => store.showPopup, { fireImmediately: true })
    private setHideNotice(showPopup: boolean) {
        if (!showPopup && this.state.isShow) {
            this.closeNotice();
        }
    }

    private closeNotice(): void {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        this.setState({ isShow: false }, () => {
            setTimeout(() => {
                this.isJoiningGame = false;
            }, 0);
        });
        const { notice } = this.state;
        notice?.onClose?.();
    }

    private handleNoticeInfo(): string {
        const { notice } = this.state;
        const language = this.props.language || '';

        if (!notice?.noticeInfo) {
            return notice?.message || '';
        }

        switch (notice.noticeInfo) {
            case NoticeInfo.DisabledGame:
                return gc.Translator.t('Common.message_disabled_game', { lng: language });

            case NoticeInfo.LostGameConnection:
                return gc.Translator.t('Common.message_lost_game_connection', { lng: language });

            case NoticeInfo.ExcludedGame:
            case NoticeInfo.DisabledAccount:
                return gc.Translator.t('Common.message_no_game_offer', { lng: language });

            default:
                return notice.message || '';
        }
    }

    render() {
        const { notice, isShow } = this.state;
        if (!isShow) {
            return <></>;
        }

        return (
            <NoticeDialog {...notice} onClose={this.closeNotice} >
                <div>{this.handleNoticeInfo()}</div>
            </NoticeDialog>
        );
    }
}
