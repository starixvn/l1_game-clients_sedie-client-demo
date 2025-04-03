export interface IOfferGame {
    gameId: number;
    minBet: number;
    maxBet: number;
    maxBetPerChoices: object;
}

export interface ILobbyState {
    offerGames: { gameId: number }[];
    isRenderGame: boolean;
    leagueToogle: boolean;
    expandedGames: { [key: string]: boolean };
    selectedGameId: number | null;
    isSessionTimeout: boolean;
    isAuthenticated: boolean;
    username: string;
}
