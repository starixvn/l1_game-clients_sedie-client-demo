import * as gc from "@sg/sg-game-client";
import { render } from "@sg/sg-observer";

import BetModalSuccess from "../bet-modal-success";
import { IPropsObserver, IStateObserver, ObserverComponent } from "../observer-component/observer-component";
import styles from "./confirm-bet.module.scss";

export interface IConfirmBet extends IStateObserver {
  totalStake: number;
  validBet: gc.Bet.IValidBet;
  betChoice: string;
  turnOffNotification: boolean;
  namespace: string;
}

const NOTIF_KEY = 'turnOffNotification';

export class ConfirmBet extends ObserverComponent<IPropsObserver, IConfirmBet> {
  private isJoiningGame = false;

  constructor(props: IPropsObserver) {
    super(props);
    this.state = {
      dispose: null,
      totalStake: 0,
      validBet: {},
      betChoice: '',
      turnOffNotification: false,
      namespace: props.namespace,
    } as IConfirmBet;
  }

  @render(gc.Bet.BetStore, (store) => store.lastReceivedBet)
  setTotalStake(lastReceivedBet: gc.Bet.ILastReceivedBet) {
    lastReceivedBet && this.setState({ totalStake: lastReceivedBet.value });
  }
  @render(gc.Bet.BetStore, (store) => store.betChoice)
  setBetChoice(betChoice: string) {
    betChoice && this.setState({ betChoice });
  }

  @render(gc.Connection.ConnectionStore, (store) => store.joinGame)
  handleJoinedGame() {
    this.isJoiningGame = true;
    this.handleClose();
  }

  @render(gc.Bet.BetStore, (store) => store.validBet)
  setIsValidBet(validBet: gc.Bet.IValidBet) {
    if (this.isJoiningGame) {
      return;
    }
    this.setState({ validBet });
  }

  handleClose = () => {
    this.setState({ validBet: { value: false } }, () => {
      setTimeout(() => {
        this.isJoiningGame = false;
      }, 0);
    });
  };


  render() {
    const { totalStake, validBet, betChoice, namespace } = this.state;
    const isShowNotification = sessionStorage.getItem(NOTIF_KEY) === 'true';

    if (!validBet?.value) {
      return <></>;
    }

    if (isShowNotification) {
      return (
        <BetModalSuccess totalStake={totalStake} />
      );
    }

    return (
      <Overlay
        totalStake={totalStake}
        betChoice={betChoice}
        handleClose={this.handleClose}
        namespace={namespace}
      />
    );
  }
}

// 接上memberSite時，className不用style，直接接上memberSite class
const Overlay = ({ totalStake, betChoice, handleClose, namespace }) => {
  const addCommas = gc.FormatUtils.numberWithCommas;
  const totalStakeWithCommas = addCommas(totalStake);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sessionStorage.setItem(NOTIF_KEY, e.target.checked ? 'true' : 'false');
  };

  return (
    <div className="overlay">
      <div id="popupPanel" className={`${styles['confirm-bet']} c-modal`}>
        <div className={`${styles['heading']} c-modal__heading`}>
          <i className="c-icon c-icon--info"></i>
          <div className="c-text" title="INFORMATION">
            {gc.Translator.t('Common.bet_info')}
          </div>
        </div>
        <div className="c-modal__container">
          <div className="c-modal__content">
            <div className="c-modal__section padding-top-10">
              <div className={`c-text-group ${styles['bet-accepted']}`}>
                <span className="c-text-label">
                  {gc.Translator.t('Common.bet_accepted')} :{' '}
                  {gc.Translator.t(`${namespace}.glossary_${betChoice}`)}
                </span>
              </div>
              <div className={`result-flex ${styles['betting-results']}`}>
                <div className={styles['betting-row']}>
                  <span className="c-text-label">
                    {gc.Translator.t('Common.total_bets')}
                  </span>
                  <span className="colon"> : </span>
                  <span className="c-text-value">&nbsp;1</span>
                </div>

                <div className={styles['betting-row']}>
                  <span className="c-text-label">
                    {gc.Translator.t('Common.total_stake')}
                  </span>
                  <span className="colon"> : </span>
                  <span className="c-text-value">
                    &nbsp;{totalStakeWithCommas}
                  </span>
                </div>
              </div>
              <label
                className={styles['noti-label']}
              >
                <input
                  id="notification"
                  className={styles['noti-input']}
                  type="checkbox"
                  onChange={handleCheckboxChange}
                  defaultChecked={sessionStorage.getItem(NOTIF_KEY) === 'true'}
                />
                {gc.Translator.t('Common.turn_off_notification')}
              </label>
            </div>
            <div className="c-btn-group">
              <div
                tabIndex={0}
                id="popup_confirm_button"
                className={`c-btn c-btn--primary ${styles['confirm-btn']}`}
                title="OK"
                onClick={handleClose}
              >
                {gc.Translator.t('Common.ok')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
