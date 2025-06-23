import { getGameSettingIds } from '../_shared/app-settings';

const getFilteredGames = (
    offerGames: {
        gameId: number;
    }[],
) => {
    const filteredGames = getGameSettingIds()
        .filter((gameId) => offerGames.find((offerGame) => offerGame.gameId === gameId))
        .map((gameId) => {
            return { gameId };
        });

    return filteredGames;
};

export { getFilteredGames };
