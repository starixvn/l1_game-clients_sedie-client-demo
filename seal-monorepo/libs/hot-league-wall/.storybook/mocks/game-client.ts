// Mock translations
export const translations = {
    en: {
        'Common.result_no': 'Round',
    },
    zh_cn: {
        'Common.result_no': '回合',
    },
    zh_tw: {
        'Common.result_no': '回合',
    },
};

let currentLanguage = 'en';

// Mock game client
export const Translator = {
    translate: (key: string) => {
        return translations[currentLanguage][key] || key;
    },
};

// 導出 gc 對象
const gc = {
    Translator
};

export default gc; 