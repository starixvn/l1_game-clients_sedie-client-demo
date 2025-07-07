import { getGameSettingIds } from '../_shared/app-settings';

const getFilteredGames = (
    offerGames: {
        gameId: number;
    }[],
) => {
    return getGameSettingIds()
        .filter((gameId) => offerGames.find((offerGame) => offerGame.gameId === gameId))
        .map((gameId) => {
            return { gameId };
        });
};


export { getFilteredGames };
