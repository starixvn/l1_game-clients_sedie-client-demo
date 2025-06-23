import { COIN_TOSS_GAME_NAMESPACE, RNGSoccer_GAME_NAMESPACE } from '../../../constant/app';

export const getChoicesType = (gameName: string, betChoice: string) => {
    if (gameName === COIN_TOSS_GAME_NAMESPACE) {
        return `${gameName}.choices_type`;
    }

    if (gameName === RNGSoccer_GAME_NAMESPACE) {
        return `${gameName}.choices_type`;
    }
    return 'choices_type';
}
