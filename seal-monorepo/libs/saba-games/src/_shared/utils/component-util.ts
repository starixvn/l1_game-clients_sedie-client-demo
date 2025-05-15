import { SE_DIE_GAME_ID, SE_DIE_GAME_NAMESPACE, BACCARAT_GAME_ID, BACCARAT_GAME_NAMESPACE, UNBALANCED_BIG_SMALL_4_GAME_ID, UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE, VIP_SE_DIE_GAME_ID, VIP_SE_DIE_GAME_NAMESPACE, FISH_PRAWN_CRAB_GAME_ID, FISH_PRAWN_CRAB_GAME_NAMESPACE, COLOR_GAME_NAMESPACE, COLOR_GAME_ID, COIN_TOSS_GAME_ID, COIN_TOSS_GAME_NAMESPACE } from "../../../constant/app";
import SieDiePage from "../../games/saba-club/sedie/page";
import VipSeDiePage from "../../games/saba-club/vip-sedie/page";
import { SieDieHeader } from "../../games/saba-club/sedie/header";
import { VipSieDieHeader } from "../../games/saba-club/vip-sedie/header";
import { BigSmallHeader } from "../../games/saba-club/big-small/header";
import BigSmallPage from "../../games/saba-club/big-small/page";
import BaccaratPage from "../../games/saba-club/baccarat/page";
import BaccaratHeader from "../../games/saba-club/baccarat/header";
import FishPrawnCrabPage from "../../games/saba-club/fish-prawn-crab/page";
import { Header as FishPrawnCrabHeader } from "../../games/saba-club/fish-prawn-crab/header";
import ColorGamePage from "../../games/saba-club/color-game/page";
import { ColorGameHeader } from "../../games/saba-club/color-game/header";
import CoinTossHeader from "../../games/saba-club/coin-toss/header"
import CoinTossPage from "../../games/saba-club/coin-toss/page"


export const gamePageMap = {
    [SE_DIE_GAME_ID]: { component: SieDiePage, namespace: SE_DIE_GAME_NAMESPACE },
    [VIP_SE_DIE_GAME_ID]: { component: VipSeDiePage, namespace: VIP_SE_DIE_GAME_NAMESPACE },
    [UNBALANCED_BIG_SMALL_4_GAME_ID]: { component: BigSmallPage, namespace: UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE },
    [BACCARAT_GAME_ID]: { component: BaccaratPage, namespace: BACCARAT_GAME_NAMESPACE },
    [FISH_PRAWN_CRAB_GAME_ID]: { component: FishPrawnCrabPage, namespace: FISH_PRAWN_CRAB_GAME_NAMESPACE },
    [COLOR_GAME_ID]: { component: ColorGamePage, namespace: COLOR_GAME_NAMESPACE },
    [COIN_TOSS_GAME_ID]: { component: CoinTossPage, namespace: COIN_TOSS_GAME_NAMESPACE },
};

export const gameHeaderMap = {
    [SE_DIE_GAME_ID]: SieDieHeader,
    [VIP_SE_DIE_GAME_ID]: VipSieDieHeader,
    [UNBALANCED_BIG_SMALL_4_GAME_ID]: BigSmallHeader,
    [BACCARAT_GAME_ID]: BaccaratHeader,
    [FISH_PRAWN_CRAB_GAME_ID]: FishPrawnCrabHeader,
    [COLOR_GAME_ID]: ColorGameHeader,
    [COIN_TOSS_GAME_ID]: CoinTossHeader
};