export const SABA_GAMES = 'SABA.games';
export const VGAMING = 'Vgaming';


export const SE_DIE_GAME_ID = 2;
export const VIP_SE_DIE_GAME_ID = 22;
export const UNBALANCED_BIG_SMALL_4_GAME_ID = 55;
export const BACCARAT_GAME_ID = 10;
export const FISH_PRAWN_CRAB_GAME_ID = 3;
export const COLOR_GAME_ID = 71;
export const COIN_TOSS_GAME_ID = 80;

export const SE_DIE_GAME_NAMESPACE = 'SeDie';
export const VIP_SE_DIE_GAME_NAMESPACE = 'VipSeDie';
export const UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE = 'UnbalancedBigSmall4';
export const BACCARAT_GAME_NAMESPACE = 'Baccarat';
export const FISH_PRAWN_CRAB_GAME_NAMESPACE = 'FishPrawnCrab';
export const COLOR_GAME_NAMESPACE = 'ColorGame';
export const COIN_TOSS_GAME_NAMESPACE = 'CoinToss';
// SiteId
// nova Vgaming , viva (SabaGames/SabaClub)
export const NOVA88_SITE_ID = '4120';
export const VIVA88_SITE_ID = '4130';

// platform
export const MOBILE = 'm';
export const DESKTOP = 'd';

export const PLATFORM_LIST = [MOBILE, DESKTOP];

export const THEME_DARK = 'dark';
export const THEME_LIGHT = 'light';

// push status
export const INIT = 'init';
export const UPDATING = 'updating';
export const UPDATED = 'updated';
export const DISPOSE = 'disposed';
export const WHOLE_APP_STATUS = [INIT, UPDATING, UPDATED, DISPOSE];

// vendor type
export const BETRADAR = 'betradar';
export const LEAP_GAMING = 'leap_gaming';
export const EDGE_GAMING = 'edge_gaming';
export const INSPIRED_GAMING = 'inspired_gaming';
export const VENDOR_LIST = [BETRADAR, LEAP_GAMING, EDGE_GAMING, INSPIRED_GAMING];

export const ROYALE = 'royale';

//platformType
export const PLATFORM_TYPE = {
    MOBILE: 'mobile',
    DESKTOP: 'desktop',
    ROYALE: 'royale',
    GALAXY: 'galaxy',
    MARS: 'mars',
};

export const PLATFORM_TYPE_NUMBER = {
    MOBILE: 0,
    DESKTOP: 1,
    ROYALE: 2,
    GALAXY: 3,
    MARS: 4,
};

export const PLATFORM_TYPE_MAPPING = {
    [PLATFORM_TYPE_NUMBER.MOBILE]: PLATFORM_TYPE.MOBILE,
    [PLATFORM_TYPE_NUMBER.DESKTOP]: PLATFORM_TYPE.DESKTOP,
    [PLATFORM_TYPE_NUMBER.ROYALE]: PLATFORM_TYPE.ROYALE,
    [PLATFORM_TYPE_NUMBER.GALAXY]: PLATFORM_TYPE.GALAXY,
    [PLATFORM_TYPE_NUMBER.MARS]: PLATFORM_TYPE.MARS,
};

export const SUPPORT_VIEW_LIST = [PLATFORM_TYPE.MARS, PLATFORM_TYPE.GALAXY];

export const DEPOSIT_STATUS = {
    NOLOGIN: 0, // 未登入
    INACTIVE: 1, // 未存款
    ACTIVE: 2, // 已存款
};
