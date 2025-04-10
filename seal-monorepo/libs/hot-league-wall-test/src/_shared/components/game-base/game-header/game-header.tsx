import React from "react";
import styles from "./game-header.module.scss";
import GameTitle from "./game-title";
import classNames from "classnames";

export interface GameHeaderProps {
    gameId: number;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    centerTextsComponent?: React.ReactNode;
    className?: string;
}

export class GameHeader extends React.Component<GameHeaderProps> {
    static defaultProps = {
        isExpanded: true
    };

    render() {
        const { centerTextsComponent, gameId, isExpanded, onToggleExpand, className } = this.props;
        const arrowProps = {
            className: classNames(styles["arrow-icon"], { [styles.collapsed]: !isExpanded }),
            onClick: onToggleExpand
        };

        return (
            <div className={classNames(styles["game-title"], className)}>
                <GameTitle gameId={gameId} arrowProps={arrowProps} />
                {centerTextsComponent}
            </div>
        );
    }
}

export default GameHeader; 