import React, { useContext } from 'react';

export type GameBettingZoneContextProps = {
    gameName: string;
    betChoice: string;
    odd?: any;
};

export type GameBettingOptionsContextProps = {
    panelId: any;
    setPanelId: (id: any) => void;
    show: boolean;
    setShow: (show: boolean) => void;
};

export const GameBettingZoneContext = React.createContext<GameBettingZoneContextProps>({
    gameName: '',
    betChoice: '',
});

export const GameBettingOptionsContext = React.createContext<GameBettingOptionsContextProps>({
    panelId: null,
    setPanelId: () => {},
    show: false,
    setShow: () => {},
});

GameBettingZoneContext.displayName = 'GameBettingZoneContext';
GameBettingOptionsContext.displayName = 'GameBettingOptionsContext';

export const GameBettingZoneContextProvider = GameBettingZoneContext.Provider;
export const GameBettingZoneContextConsumer = GameBettingZoneContext.Consumer;

export const useGameBettingZoneContext = () => useContext(GameBettingZoneContext);
export const useGameBettingOptionsContext = () => useContext(GameBettingOptionsContext);