import React, { useContext } from 'react';
import type { GamePropsContext } from '../../../games/game-base/type';

export const GameContext = React.createContext<GamePropsContext>({
    namespace: 'default',
    language: 'en'  // Adding default language
});
GameContext.displayName = 'GameContext';

export const GameContextProvider = GameContext.Provider;
export const GameContextConsumer = GameContext.Consumer;
export const useGameContext = () => useContext(GameContext);
