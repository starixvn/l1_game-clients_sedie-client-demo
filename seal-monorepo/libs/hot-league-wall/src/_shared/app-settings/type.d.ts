interface SentryOptions {
    dsn: string;
    environment: string;
}

interface SimulatorConfigs {
    gameLobbySimulatorUrl: string;
    owApiSimulatorUrl: string;
    operatorId: string;
    operatorSecret: string;
    operatorToken: string;
}

interface IGameSettings {
    id: number;
    gameName: string;
    name: string;
    namespaces: string[];
    serviceName: string;
    isVisible: boolean;
    durations: {
        wholeRound: number;
        lockingBet: number;
        placingBet: number;
        generatingResult: number;
        showingResult: number;
        startRound: number;
    };
    numberOfRoundHistory: number;
    websocket: {
        proxyPath: string;
        route: string;
    };
    mainObserverNamespace: string;
    storagePrefixKey: string;
    order: number;
    serviceName?: string;
}

export default interface AppSettings {
    serverDomain: string;
    socketGatewayPath: string;
    sentry: SentryOptions;
    gameSettings: { [id: string]: IGameSettings };
    enableMsgpackParser: boolean;
    enableMsgpackParserOnNotification: boolean;
    systemType: string;
    gamePath: string;
    gameSettingUrl: string;
    ssl: boolean;
    subDomain: string;
    env: string;
    enableMsgpackParserAllGames: boolean;
    subDirectory: string;
    simulatorConfigs: SimulatorConfigs;
    defaultGameId: number;
    userServicePath: string;
}
