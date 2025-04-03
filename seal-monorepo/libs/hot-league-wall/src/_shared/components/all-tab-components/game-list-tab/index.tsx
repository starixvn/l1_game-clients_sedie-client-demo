import * as gc from "@sg/sg-game-client";
import classNames from "classnames";
import { gamePageMap } from "../../../utils/component-util"
import styles from "./game-list-tab.module.scss";
import { SE_DIE_GAME_ID, UNBALANCED_BIG_SMALL_4_GAME_ID, UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE, VIP_SE_DIE_GAME_ID, BACCARAT_GAME_ID, BACCARAT_GAME_NAMESPACE } from "../../../../../../saba-games/constant/app";


export const GameListTab = ({ offerGames, selectedGameId, onTabClick }) => {
    const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });

    const getGameTabName = (namespace?: string) => {
        if (!namespace) return '';
        if (namespace === BACCARAT_GAME_NAMESPACE) {
            return t('Baccarat.game_tab_name');
        }

        return namespace === UNBALANCED_BIG_SMALL_4_GAME_NAMESPACE
            ? t(`${namespace}.game_tab_name`)
            : t(`${namespace}.game_name`);
    };

    return (
        <div className={styles['tab-button-wrapper']}>
            {offerGames.map(game => (
                <div
                    key={game.gameId}
                    onClick={() => onTabClick(game.gameId)}
                    className={classNames({
                        [styles['tab-button']]: true,
                        [styles['tab-button-active']]: game.gameId === selectedGameId,
                        [styles['tab-button-sedie']]: game.gameId === SE_DIE_GAME_ID,
                        [styles['tab-button-vip-sedie']]: game.gameId === VIP_SE_DIE_GAME_ID,
                        [styles['tab-button-baccarat']]: game.gameId === BACCARAT_GAME_ID,
                    })}
                >
                    <div
                        className={classNames({
                            [styles['sedie-icon']]: game.gameId === SE_DIE_GAME_ID,
                            [styles['vip-sedie-icon']]: game.gameId === VIP_SE_DIE_GAME_ID,
                            [styles['big-small-icon']]: game.gameId === UNBALANCED_BIG_SMALL_4_GAME_ID,
                            [styles['baccarat-icon']]: game.gameId === BACCARAT_GAME_ID,
                        })}
                    ></div>
                    <span>{getGameTabName(gamePageMap[game.gameId].namespace)}</span>
                </div>
            ))}
        </div>
    )

}