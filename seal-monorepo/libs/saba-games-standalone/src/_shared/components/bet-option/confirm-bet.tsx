import * as gc from "@sg/sg-game-client";
import { render } from "@sg/sg-observer";
import React from 'react';

import { IPropsObserver, IStateObserver, ObserverComponent } from "../observer-component/observer-component";

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
  }

  @render(gc.Bet.BetStore, (store) => store.lastReceivedBet)
  setTotalStake(lastReceivedBet: gc.Bet.ILastReceivedBet) {
    if (lastReceivedBet) {
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

  render() {
    // Don't render anything in the iframe
    return <></>;
  }
}
