import * as gc from '@sg/sg-game-client';

export interface ITranslationService {
    translate(key: string): string;
}

export class TranslationService implements ITranslationService {
    translate(key: string): string {
        return gc.Translator.translate(key);
    }
} 