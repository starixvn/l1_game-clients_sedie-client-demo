import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../../rng-soccer.module.scss';
import TeamCard, { TeamCardAnimation } from './team-card';
import ScoreDisplay from './score-display';
import { TeamsData } from '../models/game-result';
import { ROUND_STATE } from '@sg/sg-game-client/dist/game/rounds';
import Loading from '../../../../../_shared/components/loading';
import type { RNGSoccerResult } from '../../type';
import { SCORE_MAP } from '../utils/card-score-utils';
import { FlipCard } from '../../../../../_shared/components/card/flip-card/flip-card';
import { CardResult } from '../../../../../_shared/components/card/type';

interface GameDisplayProps {
    result?: RNGSoccerResult;
    teamData: TeamsData;
    roundState: string;
    isFinish: boolean;
    isAnimationResult: boolean;
    isFinishShowResult: boolean;
    isLoading: boolean;
}

const useTeamCardAnimation = (roundState: string, teamData: TeamsData) => {
    const prevTeamDataRef = useRef<TeamsData | null>(null);

    return useMemo(() => {
        const isTeamChanged =
            prevTeamDataRef.current &&
            (prevTeamDataRef.current.homeTeam.name !== teamData.homeTeam.name ||
                prevTeamDataRef.current.awayTeam.name !== teamData.awayTeam.name);
        prevTeamDataRef.current = teamData;

        if (!isTeamChanged) {
            return TeamCardAnimation.NONE;
        }

        if (roundState === ROUND_STATE.STARTING_ROUND) {
            return TeamCardAnimation.POP_OUT;
        }
        if (roundState === ROUND_STATE.PLACING_BET || roundState === ROUND_STATE.LOCKING_BET) {
            return TeamCardAnimation.POP_IN;
        }
        return TeamCardAnimation.NONE;
    }, [roundState, teamData]);
};

/**
 * Main game display component
 * Following the Open/Closed principle by using composition over inheritance
 */
export const GameDisplay: React.FC<GameDisplayProps> = ({
    result,
    teamData,
    roundState,
    isFinish,
    isAnimationResult,
    isFinishShowResult,
    isLoading,
}) => {
    const homeCardData = useMemo(() => {
        const card: CardResult = {
            rank: result?.home?.rank ?? 0,
            suit: result?.home?.suit ?? 0,
        };
        const score = SCORE_MAP[card.rank] || 0;
        return { card, score };
    }, [result?.home]);

    const awayCardData = useMemo(() => {
        const card: CardResult = {
            rank: result?.away?.rank ?? 0,
            suit: result?.away?.suit ?? 0,
        };
        const score = SCORE_MAP[card.rank] || 0;
        return { card, score };
    }, [result?.away]);

    const shouldHideCards = !isFinish || roundState === ROUND_STATE.PLACING_BET || roundState === ROUND_STATE.LOCKING_BET;

    const showDefaultScores = !isFinish;

    const teamCardAnimation = useTeamCardAnimation(roundState, teamData);

    const [showHomeScore, setShowHomeScore] = useState(false);
    const [showAwayScore, setShowAwayScore] = useState(false);
    const [showHighLight, setShowHighLight] = useState(false);

    useEffect(() => {
        if (roundState === ROUND_STATE.PLACING_BET) {
            setShowHomeScore(false);
            setShowAwayScore(false);
        }

        if (isFinishShowResult && (roundState === ROUND_STATE.SHOW_RESULT || roundState === ROUND_STATE.SHOW_ANIMATION_RESULT)) {
            setShowHighLight(true);
        } else {
            setShowHighLight(false);
        }
    }, [roundState, isFinishShowResult]);

    if (isLoading) {
        return <Loading />;
    }

    const isHideTeamName = teamData.homeTeam.name === 'HIDE_HOME_NAME' || teamData.awayTeam.name === 'HIDE_AWAY_NAME';
    return (
        <div className={styles['wrapper-sport-middle']}>
            <TeamCard logo={teamData.homeTeam.logo} isHomeTeam={true} animation={teamCardAnimation} />

            <div className={styles['sport-result']}>
                <div className={styles['container-result']}>
                    {/* Home card */}
                    <div
                        className={`${styles['card-section']} ${showHighLight && homeCardData.score > awayCardData.score ? styles['winning-card'] : ''}`}
                    >
                        <FlipCard
                            playResultAnimation={isAnimationResult}
                            card={homeCardData.card}
                            isShowResult={!shouldHideCards}
                            onFlipComplete={() => {
                                if (!shouldHideCards) {
                                    setShowHomeScore(true);
                                }
                            }}
                        />
                    </div>
                    <ScoreDisplay
                        homeScore={showHomeScore ? homeCardData.score : ''}
                        awayScore={showAwayScore ? awayCardData.score : ''}
                        showWinningHighlight={showHighLight}
                        showDefaultScore={showDefaultScores}
                    />
                    <div
                        className={`${styles['card-section']} ${showHighLight && awayCardData.score > homeCardData.score ? styles['winning-card'] : ''}`}
                    >
                        <FlipCard
                            playResultAnimation={isAnimationResult}
                            card={awayCardData.card}
                            isShowResult={!shouldHideCards}
                            delayTime={isAnimationResult ? 1000 : 0}
                            onFlipComplete={() => {
                                if (!shouldHideCards) {
                                    setShowAwayScore(true);
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
            <TeamCard logo={teamData.awayTeam.logo} isHomeTeam={false} animation={teamCardAnimation} />

            <div className={`${styles['wrapper-team-name']} ${isHideTeamName ? styles['hide-team-name'] : ''}`}>
                <div className={styles['name']}>{teamData.homeTeam.name}</div>
                <div className={styles['name']}>{teamData.awayTeam.name}</div>
            </div>
        </div>
    );
};

export default GameDisplay;
