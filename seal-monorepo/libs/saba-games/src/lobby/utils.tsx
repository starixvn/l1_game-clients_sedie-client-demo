import { getGameSettingIds } from '../_shared/app-settings';

const getFilteredGames = (
    offerGames: {
        gameId: number;
    }[],
) => {
    console.log('[getFilteredGames] Input offerGames:', offerGames);
    console.log('[getFilteredGames] Available game settings IDs:', getGameSettingIds());

    const filteredGames = getGameSettingIds()
        .filter((gameId) => offerGames.find((offerGame) => offerGame.gameId === gameId))
        .map((gameId) => {
            return { gameId };
        });

    console.log('[getFilteredGames] Filtered games result:', filteredGames);
    return filteredGames;
};

export { getFilteredGames };
