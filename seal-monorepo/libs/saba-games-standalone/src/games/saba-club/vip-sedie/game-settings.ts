import * as gc from "@sg/sg-game-client";
import { getGameSetting, getSiteConfig } from "../../../_shared/app-settings";
import { sharedContainer } from "../../../_shared/components/game-base/startup";
import { GameIds } from "../../../_shared/constants";

export const setting = getGameSetting(GameIds.VipSeDie);
export const siteConfigs = getSiteConfig(GameIds.VipSeDie);

export const containerOptions: gc.IContainerOptions = gc.getGameContainer(setting, siteConfigs, sharedContainer); 