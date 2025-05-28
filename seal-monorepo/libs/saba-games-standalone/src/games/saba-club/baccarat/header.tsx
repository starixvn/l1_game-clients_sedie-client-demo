import React from 'react';
import { GameHeader } from '../../../_shared/components/game-base/game-header/game-header';
import styles from './baccarat.module.scss';
import classNames from 'classnames';
import GameHeaderCenterTexts from '../../../_shared/components/game-base/game-header/game-header-center-texts';
import * as gc from "@sg/sg-game-client";

interface BaccaratHeaderProps {
    gameId: number;
    isExpanded?: boolean;
    handleToggle?: () => void;
    namespace: string;
    centerTextsComponent?: React.ReactNode;
}

const BaccaratHeader: React.FC<BaccaratHeaderProps> = ({ gameId, isExpanded, handleToggle: onToggleExpand, centerTextsComponent }) => {
    return (
        <div className={classNames(styles.header, 'baccarat-header')}>
            <GameHeader
                gameId={gameId}
                isExpanded={isExpanded}
                onToggleExpand={onToggleExpand}
                centerTextsComponent={isExpanded && <GameHeaderCenterTexts texts={[
                    gc.Translator.t('Baccarat.glossary_player') + '/' + gc.Translator.t('Baccarat.glossary_banker'),
                    gc.Translator.t('Baccarat.glossary_tie'),
                    gc.Translator.t('Baccarat.banker_player_pair')
                ]} />}
                className={styles.baccaratGameTitle}
            />
        </div>
    );
};

export default BaccaratHeader; 