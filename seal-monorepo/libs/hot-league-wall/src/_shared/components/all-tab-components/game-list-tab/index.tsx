import * as gc from "@sg/sg-game-client";
import classNames from "classnames";
import { gamePageMap } from "../../../utils/component-util"
import styles from "./game-list-tab.module.scss";
import { SE_DIE_GAME_ID, VIP_SE_DIE_GAME_ID } from "../../../../../constant/app";


export const GameListTab = ({ offerGames, selectedGameId, onTabClick }) => {
    console.log('GameListTab rendered with props:', { offerGames, selectedGameId });

    const t = (key) => gc.Translator.translate(key, { languageId: gc.Translator.getCurrentLanguageId() });

    const getGameTabName = (namespace?: string) => {
        if (!namespace) return '';


        const name = t(`${namespace}.game_name`);
        console.log(`Game tab name for namespace ${namespace}:`, name);
        return name;
    };

    const handleTabClick = (gameId) => {
        console.log('Tab clicked with gameId:', gameId);
        onTabClick(gameId);
    };

    return (
        <div className={styles['tab-button-wrapper']}>
            {offerGames.map(game => (
                <div
                    key={game.gameId}
                    onClick={() => handleTabClick(game.gameId)}
                    className={classNames({
                        [styles['tab-button']]: true,
                        [styles['tab-button-active']]: game.gameId === selectedGameId,
                        [styles['tab-button-sedie']]: game.gameId === SE_DIE_GAME_ID,
                        [styles['tab-button-vip-sedie']]: game.gameId === VIP_SE_DIE_GAME_ID,
                    })}
                >
                    <div
                        className={classNames({
                            [styles['sedie-icon']]: game.gameId === SE_DIE_GAME_ID,
                            [styles['vip-sedie-icon']]: game.gameId === VIP_SE_DIE_GAME_ID,
                        })}
                    ></div>
                    <span>{getGameTabName(gamePageMap[game.gameId].namespace)}</span>
                </div>
            ))}
        </div>
    )

}