import * as gc from "@sg/sg-game-client";
import { render } from "@sg/sg-observer";
import React from 'react';

import { IPropsObserver, IStateObserver, ObserverComponent } from "../observer-component/observer-component";
import BetModalSuccess from "../bet-modal-success";

const DEBUG_STYLE = 'color: red; font-weight: bold;';

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

    // Listen for messages from parent window
    window.addEventListener('message', this.handleParentMessage);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleParentMessage);
  }

  private handleParentMessage = (event: MessageEvent) => {
    if (event.data.type === 'HIDE_CONFIRM_BET') {
      console.log('%c[IFRAME] Received HIDE_CONFIRM_BET with notification setting:', DEBUG_STYLE, event.data);

      // Update notification setting
      if (typeof event.data.turnOffNotification === 'boolean') {
        console.log('%c[IFRAME] Updating notification setting:', DEBUG_STYLE, event.data.turnOffNotification);
        sessionStorage.setItem(NOTIF_KEY, event.data.turnOffNotification ? 'true' : 'false');
        this.setState({ turnOffNotification: event.data.turnOffNotification });
      }
    }
  };

  @render(gc.Bet.BetStore, (store) => store.lastReceivedBet)
  setTotalStake(lastReceivedBet: gc.Bet.ILastReceivedBet) {
    if (lastReceivedBet) {
      // Check if notifications are turned off
      const isNotificationTurnedOff = sessionStorage.getItem(NOTIF_KEY) === 'true';
      console.log('%c[IFRAME] Checking notification setting:', DEBUG_STYLE, { isNotificationTurnedOff });

      if (isNotificationTurnedOff) {
        console.log('%c[IFRAME] Notifications turned off, showing BetModalSuccess', DEBUG_STYLE);
        this.setState({ totalStake: lastReceivedBet.value });
        return;
      }

      console.log('%c[IFRAME] Sending SHOW_CONFIRM_BET message', DEBUG_STYLE, {
        totalStake: lastReceivedBet.value,
        betChoice: this.state.betChoice,
        namespace: this.state.namespace
      });

      this.setState({ totalStake: lastReceivedBet.value });

      // Log the message being sent
      const message = {
        type: 'SHOW_CONFIRM_BET',
        payload: {
          totalStake: lastReceivedBet.value,
          betChoice: this.state.betChoice,
          namespace: this.state.namespace,
          isVisible: true
        }
      };
      console.log('%c[IFRAME] Posting message to parent:', DEBUG_STYLE, message);

      try {
        window.parent.postMessage(message, '*');
        console.log('%c[IFRAME] Message sent successfully', DEBUG_STYLE);
      } catch (error) {
        console.error('%c[IFRAME] Error sending message:', DEBUG_STYLE, error);
      }
    }
  }

  @render(gc.Bet.BetStore, (store) => store.betChoice)
  setBetChoice(betChoice: string) {
    if (betChoice) {
      console.log('%c[IFRAME] Bet choice updated', DEBUG_STYLE, { betChoice });
      this.setState({ betChoice });
    }
  }

  @render(gc.Connection.ConnectionStore, (store) => store.joinGame)
  handleJoinedGame() {
    console.log('%c[IFRAME] Game joined, closing confirm bet', DEBUG_STYLE);
    this.isJoiningGame = true;
    this.handleClose();
  }

  @render(gc.Bet.BetStore, (store) => store.validBet)
  setIsValidBet(validBet: gc.Bet.IValidBet) {
    if (this.isJoiningGame) {
      return;
    }
    console.log('%c[IFRAME] Valid bet updated', DEBUG_STYLE, { validBet });
    this.setState({ validBet });
  }

  handleClose = () => {
    console.log('%c[IFRAME] Sending HIDE_CONFIRM_BET message', DEBUG_STYLE);
    this.setState({ validBet: { value: false } }, () => {
      window.parent.postMessage({
        type: 'HIDE_CONFIRM_BET'
      }, '*');
      setTimeout(() => {
        this.isJoiningGame = false;
      }, 0);
    });
  };

  private shouldShowBetModalSuccess(): boolean {
    const { validBet, totalStake } = this.state;
    const isNotificationTurnedOff = sessionStorage.getItem(NOTIF_KEY) === 'true';

    console.log('%c[IFRAME] Checking if should show BetModalSuccess:', DEBUG_STYLE, {
      hasValidBet: !!validBet?.value,
      totalStake,
      isNotificationTurnedOff
    });

    return !!validBet?.value && isNotificationTurnedOff && totalStake > 0;
  }

  render() {
    const { totalStake, validBet } = this.state;

    if (!validBet?.value) {
      console.log('%c[IFRAME] Not rendering - invalid bet', DEBUG_STYLE);
      return <></>;
    }

    if (this.shouldShowBetModalSuccess()) {
      console.log('%c[IFRAME] Rendering BetModalSuccess', DEBUG_STYLE, { totalStake });
      return <BetModalSuccess totalStake={totalStake} />;
    }

    console.log('%c[IFRAME] Not rendering - waiting for parent window', DEBUG_STYLE);
    return <></>;
  }
}
