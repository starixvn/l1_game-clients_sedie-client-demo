import * as gc from '@sg/sg-game-client';
import en from './locales/en.json';
import vi from './locales/vi.json';
import id from './locales/id.json';
import th from './locales/th.json';
import zh_cn from './locales/zh_cn.json';
import zh_tw from './locales/zh_tw.json';

const languages: any = {
    en,
    vi,
    id,
    th,
    zh_cn,
    zh_tw,
};


export const loadI18n = (propLanguageId: string) => {
    try {
        const languageIds = ['en', 'id', 'th', 'vi', 'zh_cn', 'zh_tw'];
        const languageId = propLanguageId;

        const translationOptions: gc.Shared.utils.TranslationOptions = {
            languageId: languageId,
            isUseTolgeeRealTime: false,
            getStaticData: (languageId) => {
                return languages[languageId];
            },
            availableLanguages: languageIds,
            onLoaded: () => { },
        };

        gc.Translator.init(translationOptions);
    } catch (e) {
        // Error handling silently
    }
};
