import { SE_DIE_GAME_NAMESPACE } from '../../../constant/app';
import { SE_DIE_CHOICES } from '../../games/constants/saba-club';

export const getChoicesType = (gameName: string, betChoice: string) => {
    if (gameName === SE_DIE_GAME_NAMESPACE) {
        switch (betChoice) {
            case SE_DIE_CHOICES.ODD:
            case SE_DIE_CHOICES.EVEN:
                return `${gameName}.choices_type1`;
            case SE_DIE_CHOICES.RED4:
            case SE_DIE_CHOICES.RED3:
            case SE_DIE_CHOICES.RED2:
            case SE_DIE_CHOICES.WHITE4:
            case SE_DIE_CHOICES.WHITE3:
                return `${gameName}.choices_type2`;
            default:
                return '';
        }
    }

    return 'choices_type';
}
