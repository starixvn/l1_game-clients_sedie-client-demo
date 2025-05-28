import {
  gamePageMap,
  gameHeaderMap,
} from 'libs/saba-games/src/_shared/utils/component-util'; // Update the path accordingly

import SieDiePage from 'libs/saba-games/src/games/saba-club/sedie/page';
import VipSeDiePage from 'libs/saba-games/src/games/saba-club/vip-sedie/page';
import BigSmallPage from 'libs/saba-games/src/games/saba-club/big-small/page';
import BaccaratPage from 'libs/saba-games/src/games/saba-club/baccarat/page';
import BaccaratHeader from 'libs/saba-games/src/games/saba-club/baccarat/header';

import {
  SE_DIE_GAME_ID,
  SE_DIE_GAME_NAMESPACE,
  VIP_SE_DIE_GAME_ID,
  VIP_SE_DIE_GAME_NAMESPACE,
  UNBALANCED_BIG_SMALL_4_GAME_ID,
  UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE,
  BACCARAT_GAME_ID,
  BACCARAT_GAME_NAMESPACE,
} from 'libs/saba-games/constant/app';
import { SieDieHeader } from 'libs/saba-games/src/games/saba-club/sedie/header';
import { BigSmallHeader } from 'libs/saba-games/src/games/saba-club/big-small/header';
import { VipSieDieHeader } from 'libs/saba-games/src/games/saba-club/vip-sedie/header';

describe('gamePageMap', () => {
  it('maps SE_DIE_GAME_ID to correct component and namespace', () => {
    expect(gamePageMap[SE_DIE_GAME_ID].component.name).toBe(SieDiePage.name);
    expect(gamePageMap[SE_DIE_GAME_ID].namespace).toBe(SE_DIE_GAME_NAMESPACE);
  });

  it('maps VIP_SE_DIE_GAME_ID to correct component and namespace', () => {
    expect(gamePageMap[VIP_SE_DIE_GAME_ID].component.name).toBe(VipSeDiePage.name);
    expect(gamePageMap[VIP_SE_DIE_GAME_ID].namespace).toBe(VIP_SE_DIE_GAME_NAMESPACE);
  });

  it('maps UNBALANCED_BIG_SMALL_4_GAME_ID to correct component and namespace', () => {
    expect(gamePageMap[UNBALANCED_BIG_SMALL_4_GAME_ID].component.name).toBe(BigSmallPage.name);
    expect(gamePageMap[UNBALANCED_BIG_SMALL_4_GAME_ID].namespace).toBe(UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE);
  });

  it('maps BACCARAT_GAME_ID to correct component and namespace', () => {
    expect(gamePageMap[BACCARAT_GAME_ID].component.name).toBe(BaccaratPage.name);
    expect(gamePageMap[BACCARAT_GAME_ID].namespace).toBe(BACCARAT_GAME_NAMESPACE);
  });
});

describe('gameHeaderMap', () => {
  it('maps SE_DIE_GAME_ID to SieDieHeader', () => {
    expect(gameHeaderMap[SE_DIE_GAME_ID].name).toBe(SieDieHeader.name);
  });

  it('maps VIP_SE_DIE_GAME_ID to VipSieDieHeader', () => {
    expect(gameHeaderMap[VIP_SE_DIE_GAME_ID].name).toBe(VipSieDieHeader.name);
  });

  it('maps UNBALANCED_BIG_SMALL_4_GAME_ID to BigSmallHeader', () => {
    expect(gameHeaderMap[UNBALANCED_BIG_SMALL_4_GAME_ID].name).toBe(BigSmallHeader.name);
  });

  it('maps BACCARAT_GAME_ID to BaccaratHeader', () => {
    expect(gameHeaderMap[BACCARAT_GAME_ID].name).toBe(BaccaratHeader.name);
  });
});

