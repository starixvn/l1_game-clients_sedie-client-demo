import { BACCARAT_GAME_NAMESPACE, COLOR_GAME_NAMESPACE, COIN_TOSS_GAME_NAMESPACE, FISH_PRAWN_CRAB_GAME_NAMESPACE, SE_DIE_GAME_NAMESPACE, UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE, VIP_SE_DIE_GAME_NAMESPACE } from '../../../constant/app';
import { SE_DIE_CHOICES, BACCARAT_CHOICES } from '../../games/constants/saba-club';

export const getChoicesType = (gameName: string, betChoice: string) => {
    if (gameName === SE_DIE_GAME_NAMESPACE || gameName === VIP_SE_DIE_GAME_NAMESPACE) {
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

    if (gameName === UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE) {
        return `${gameName}.choices_type`;
    }

    if (gameName === BACCARAT_GAME_NAMESPACE) {
        switch (betChoice) {
            case BACCARAT_CHOICES.PLAYER:
            case BACCARAT_CHOICES.BANKER:
                return `${gameName}.banker_player`;
            case BACCARAT_CHOICES.PLAYER_PAIR:
            case BACCARAT_CHOICES.BANKER_PAIR:
                return `${gameName}.banker_player_pair`;
            case BACCARAT_CHOICES.TIE:
                return `${gameName}.glossary_tie`;
            default:
                return '';
        }
    }

    if (gameName === FISH_PRAWN_CRAB_GAME_NAMESPACE) {
        return `${gameName}.bet_choices_type`;
    }

    if (gameName === COLOR_GAME_NAMESPACE) {
        return `${gameName}.bet_choices_type`;
    }

    if (gameName === COIN_TOSS_GAME_NAMESPACE) {
        return `${gameName}.choices_type`;
    }
    return 'choices_type';
}
