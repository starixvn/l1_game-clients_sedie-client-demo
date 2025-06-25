import { RNGSoccer_GAME_ID, RNGSoccer_GAME_NAMESPACE } from '../../../constant/app';
import RNGSoccerPage from '../../games/saba-club/rng-soccer/page';
import RNGSoccerBeforeStartGame from '../../games/saba-club/rng-soccer-before-start-game';

export const gamePageMap = {
    [RNGSoccer_GAME_ID]: { component: RNGSoccerPage, namespace: RNGSoccer_GAME_NAMESPACE },
    // [RNGSoccer_GAME_ID]: { component: RNGSoccerBeforeStartGame, namespace: RNGSoccer_GAME_NAMESPACE },
};

export const gameHeaderMap = {
    // [RNGSoccer_GAME_ID]: RNGSoccerHeader,
};
