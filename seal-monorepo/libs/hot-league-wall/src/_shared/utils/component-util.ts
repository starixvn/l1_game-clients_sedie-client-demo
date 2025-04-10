import { SE_DIE_GAME_ID, SE_DIE_GAME_NAMESPACE } from "../../../constant/app";
import SieDiePage from "../../games/saba-club/sedie/page";
import { SieDieHeader } from "../../games/saba-club/sedie/header";

export const gamePageMap = {
    [SE_DIE_GAME_ID]: { component: SieDiePage, namespace: SE_DIE_GAME_NAMESPACE },

};

export const gameHeaderMap = {
    [SE_DIE_GAME_ID]: SieDieHeader
};