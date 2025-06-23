import type { RNGSoccerResult } from '../../type';
import { TeamUtils } from '../utils/team-utils';
import homeDefaultLogo from '../../../../../assets/rng-soccer/team-icon/home-default-logo.svg';
import awayDefaultLogo from '../../../../../assets/rng-soccer/team-icon/away-default-logo.svg';

export interface MatchTeams {
    home: string;
    away: string;
}

/**
 * Team data structure
 */
export interface TeamData {
    name: string;
    logo: string;
    color: string;
}

/**
 * Game teams data structure
 */
export interface TeamsData {
    homeTeam: TeamData;
    awayTeam: TeamData;
}

/**
 * Default result values
 */
export const DEFAULT_RESULT: RNGSoccerResult = {
    homeScore: 0,
    awayScore: 0,
    home: { rank: 0, suit: 0 },
    away: { rank: 0, suit: 1 },
};

/**
 * Game result model to handle result data
 * Following the Single Responsibility Principle
 */
export class GameResult {
    /**
     * Get default team data
     * @param homeTeamAbbr Home team abbreviation
     * @param awayTeamAbbr Away team abbreviation
     * @returns Team data object
     */
    public static getDefaultTeamData(
        homeTeamAbbr: string = "DEFAULT_HOME",
        awayTeamAbbr: string = "DEFAULT_AWAY"
    ): TeamsData {
        return {
            homeTeam: {
                name: TeamUtils.getTeamFullName(homeTeamAbbr),
                logo: TeamUtils.getTeamLogo(homeTeamAbbr),
                color: TeamUtils.getTeamDefaultColor()
            },
            awayTeam: {
                name: TeamUtils.getTeamFullName(awayTeamAbbr),
                logo: TeamUtils.getTeamLogo(awayTeamAbbr),
                color: TeamUtils.getTeamDefaultColor()
            }
        };
    }

    /**
     * Update team data based on game result
     * @param result The game result
     * @param currentTeamData Current team data (optional)
     * @returns Updated team data
     */
    public static updateTeamData(
        match: MatchTeams,
        currentTeamData?: TeamsData
    ): TeamsData {
        if (!match || !match.home || !match.away) {
            return currentTeamData || GameResult.getDefaultTeamData();
        }

        return {
            homeTeam: {
                name: TeamUtils.getTeamFullName(match.home),
                logo: TeamUtils.getTeamLogo(match.home),
                color: TeamUtils.getTeamDefaultColor()
            },
            awayTeam: {
                name: TeamUtils.getTeamFullName(match.away),
                logo: TeamUtils.getTeamLogo(match.away),
                color: TeamUtils.getTeamDefaultColor()
            }
        };
    }
} 