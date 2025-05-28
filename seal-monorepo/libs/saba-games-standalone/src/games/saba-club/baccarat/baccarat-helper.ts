import * as gc from "@sg/sg-game-client";

export const Choices = {
    banker: "banker",
    player: "player",
    tie: "tie",
    bankerPair: "bankerPair",
    playerPair: "playerPair",
};

export const BaccaratConfigs = {
    choices: [
        {
            name: "player",
            style: "player",
            label: () => gc.Translator.t('Baccarat.glossary_player')
        },
        {
            name: "tie",
            style: "tie",
            label: () => gc.Translator.t('Baccarat.glossary_tie')
        },
        {
            name: "banker",
            style: "banker",
            label: () => gc.Translator.t('Baccarat.glossary_banker')
        },
        {
            name: "playerPair",
            style: "player-pair",
            label: () => gc.Translator.t('Baccarat.glossary_playerPair')
        },
        {
            name: "bankerPair",
            style: "bank-pair",
            label: () => gc.Translator.t('Baccarat.glossary_bankerPair')
        },
    ],
};

export const StatisticRuleEntriesBankerPlayer = Object.entries({
    [Choices.player]: (countResult: object, total: number) =>
        countResult[Choices.player] ? Math.round((countResult[Choices.player] * 100) / total) : 0,
    [Choices.tie]: (countResult: object, total: number) =>
        countResult[Choices.tie] ? Math.round((countResult[Choices.tie] * 100) / total) : 0,
    [Choices.banker]: (countResult: object, total: number) =>
        100 -
        (countResult[Choices.player] ? Math.round((countResult[Choices.player] * 100) / total) : 0) -
        (countResult[Choices.tie] ? Math.round((countResult[Choices.tie] * 100) / total) : 0),
});

export const StatisticRuleMapping = [StatisticRuleEntriesBankerPlayer];

export const GetTranslateChoiceMapping = (gameName = "Baccarat") => {
    return {
        player: gc.Translator.t(`${gameName}.glossary_player`),
        banker: gc.Translator.t(`${gameName}.glossary_banker`),
        tie: gc.Translator.t(`${gameName}.glossary_tie`),
        playerPair: gc.Translator.t(`${gameName}.glossary_playerPair`),
        bankerPair: gc.Translator.t(`${gameName}.glossary_bankerPair`),
    };
};

export const ChoiceForTabActive = [
    {
        choice: ["banker", "player", "tie"],
    }
];
