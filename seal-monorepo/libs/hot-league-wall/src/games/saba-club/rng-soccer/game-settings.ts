import * as gc from '@sg/sg-game-client';
import { getGameSetting, getSiteConfig } from '../../../_shared/app-settings';
import { sharedContainer } from '../../../games/game-base/startup';
import { GameIds } from '../../../_shared/constants';

export const setting = getGameSetting(GameIds.RNGSoccer);
export const siteConfigs = getSiteConfig(GameIds.RNGSoccer);

export const containerOptions: gc.IContainerOptions = gc.getGameContainer(setting, siteConfigs, sharedContainer); 