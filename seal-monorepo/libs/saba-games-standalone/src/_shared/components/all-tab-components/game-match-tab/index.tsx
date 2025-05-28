import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./game-match-tab.module.scss";
import classNames from "classnames";
import { AppContextConsumer } from "../../../../appProvider";
import { gameHeaderMap, gamePageMap } from "../../../utils/component-util";

interface GameMatchTabProps {
    gameId?: any;
    className?: any;
    leagueToogle: boolean;
    language: string;
}

export const GameMatchTab: React.FC<GameMatchTabProps> = ({ gameId, className, leagueToogle, language }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const firstRender = useRef(true);

    const handleToggle = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        setIsExpanded(leagueToogle);
    }, [leagueToogle]);

    const gameMapInfo = gamePageMap[gameId];
    const namespace = gameMapInfo?.namespace;
    const GameHeaderComponent = gameHeaderMap[gameId] || null;
    const GamePageComponent = gameMapInfo?.component || null;

    return (
        <div className={className}>
            <div className="c-league">
                <GameHeaderComponent isExpanded={isExpanded} handleToggle={handleToggle} namespace={namespace} gameId={gameId} language={language} />
                <div
                    className={classNames(styles['game-lobby'], {
                        [styles['collapsed']]: !isExpanded,
                        'c-match-group': true,
                        'c-is-open': isExpanded,
                    })}
                >
                    <div className='c-match c-in-play'>
                        <AppContextConsumer>
                            {({ language }) =>
                                GamePageComponent && (
                                    <GamePageComponent namespace={namespace} language={language} />
                                )
                            }
                        </AppContextConsumer>
                    </div>
                </div>
            </div>
        </div>
    );
};