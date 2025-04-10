import axios from 'axios';
import { getEnvironmentConfig, requestSSO_SITE_ID, reuqestSSO_APP_ENV } from '../app-settings';

const appSettings = getEnvironmentConfig({
    appEnv: reuqestSSO_APP_ENV,
    siteId: requestSSO_SITE_ID,
});

const systemType = appSettings.systemType;

const randomIntFromInterval = (min: number, max: number) => {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
};

const randomPlayerId = randomIntFromInterval(1000000, 9999999);

export const requestSSO = async (gameId = 0) => {
    const searchParams = new URLSearchParams(window.location.search);
    const playerId = Number(searchParams.get('playerId')) || randomPlayerId;
    const currency = searchParams.get('currency');

    const appType = 6;
    const playerBalance = 10000;

    //temp hard code to get token
    const currencyDefault = systemType === 'SG' ? '$US' : 'INH';
    const operatorId = appSettings.simulatorConfigs.operatorId;
    const operatorSecret = appSettings.simulatorConfigs.operatorSecret;
    const operatorToken = appSettings.simulatorConfigs.operatorToken;

    const request = {
        playerId: playerId,
        playerName: `username_${playerId}`,
        language: 'vi-VN',
        currency: currency || currencyDefault,
        seq: 'd,y,lumi',
        siteId: '4100300',
        siteName: 'lumi',
        ip: '10.5.10.17, 10.233.120.0',
        browserUserAgent: global?.window?.navigator?.userAgent || '',
        auth: {
            operatorId,
            operatorSecret,
        },
        operatorToken,
        gameId,
        domain: 'example.com',
        appType,
        isCash: true,
        partner: '1W',
    };

    const gameLobbySimulatorUrl = appSettings.simulatorConfigs.gameLobbySimulatorUrl;
    const ssoResult = (await axios.post(`${gameLobbySimulatorUrl}/signin/sso`, request)).data;
    await createCustomer(playerId, 'ow', request.siteId);
    await assignBalance(playerId, playerBalance, request.currency, request.siteId);

    return ssoResult;
};

const assignBalance = async (playerId: number, balance: number, currency: string, siteId: string) => {
    await axios.post(
        `${appSettings.simulatorConfigs.owApiSimulatorUrl}/SetDefaultBalance?playerId=${encodeURIComponent(
            playerId,
        )}&operator=ow&balance=${balance}&systemType=${systemType}&username=username_${encodeURIComponent(
            playerId,
        )}&currency=${currency}&siteId=${siteId}`,
    );
};

const createCustomer = async (playerId: number, operator: string, siteId: string) => {
    await axios.post(
        `${appSettings.simulatorConfigs.owApiSimulatorUrl}/CreateCustomer?memId=${encodeURIComponent(
            playerId,
        )}&operator=${operator}&systemType=${systemType}&siteId=${siteId}`,
    );
};
