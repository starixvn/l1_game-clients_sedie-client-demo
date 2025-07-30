import LIV_ICON from '../../../../../assets/rng-soccer/team-icon/LIV.png';
import ARS_ICON from '../../../../../assets/rng-soccer/team-icon/ARS.png';
import MCI_ICON from '../../../../../assets/rng-soccer/team-icon/MCI.png';
import ATM_ICON from '../../../../../assets/rng-soccer/team-icon/ATM.png';
import NAP_ICON from '../../../../../assets/rng-soccer/team-icon/NAP.png';
import ROM_ICON from '../../../../../assets/rng-soccer/team-icon/ROM.png';
import JUV_ICON from '../../../../../assets/rng-soccer/team-icon/JUV.png';
import INT_ICON from '../../../../../assets/rng-soccer/team-icon/INT.png';
import BAR_ICON from '../../../../../assets/rng-soccer/team-icon/BAR.png';
import PSG_ICON from '../../../../../assets/rng-soccer/team-icon/PSG.png';
import BAY_ICON from '../../../../../assets/rng-soccer/team-icon/BAY.png';
import RMA_ICON from '../../../../../assets/rng-soccer/team-icon/RMA.png';
import LEV_ICON from '../../../../../assets/rng-soccer/team-icon/LEV.png';
import ATA_ICON from '../../../../../assets/rng-soccer/team-icon/ATA.png';
import ATH_ICON from '../../../../../assets/rng-soccer/team-icon/ATH.png';
import AVL_ICON from '../../../../../assets/rng-soccer/team-icon/AVL.png';
import BEN_ICON from '../../../../../assets/rng-soccer/team-icon/BEN.png';
import SPO_ICON from '../../../../../assets/rng-soccer/team-icon/SPO.png';
import NFO_ICON from '../../../../../assets/rng-soccer/team-icon/NFO.png';
import BOL_ICON from '../../../../../assets/rng-soccer/team-icon/BOL.png';
import homeDefaultLogo from '../../../../../assets/rng-soccer/team-icon/home-default-logo.svg';
import awayDefaultLogo from '../../../../../assets/rng-soccer/team-icon/away-default-logo.svg';

/**
 * Team information interface
 */
export interface TeamInfo {
    fullName: string;
    shortName: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
}

/**
 * Utility class for team operations
 * Following Single Responsibility Principle by separating team logic
 */
export class TeamUtils {
    /**
     * Team mapping with team information
     */
    public static readonly TEAM_INFO: Record<string, TeamInfo> = {
        DEFAULT_HOME: {
            fullName: 'Home Team',
            shortName: 'DEFAULT_HOME',
            logo: homeDefaultLogo,
            primaryColor: '#FFFFFF',
            secondaryColor: '#FFFFFF',
        },
        DEFAULT_AWAY: {
            fullName: 'Away Team',
            shortName: 'DEFAULT_AWAY',
            logo: awayDefaultLogo,
            primaryColor: '#FFFFFF',
            secondaryColor: '#FFFFFF',
        },
        HIDE_HOME_NAME: {
            fullName: '',
            shortName: '',
            logo: homeDefaultLogo,
            primaryColor: '#FFFFFF',
            secondaryColor: '#FFFFFF',
        },
        HIDE_AWAY_NAME: {
            fullName: '',
            shortName: '',
            logo: awayDefaultLogo,
            primaryColor: '#FFFFFF',
            secondaryColor: '#FFFFFF',
        },
        LIV: { fullName: 'Liverpool FC', shortName: 'LIV', logo: LIV_ICON, primaryColor: '#C8102E', secondaryColor: '#00B2A9' },
        INT: { fullName: 'Inter Milan', shortName: 'INT', logo: INT_ICON, primaryColor: '#0066B3', secondaryColor: '#000000' },
        BAR: { fullName: 'Barcelona', shortName: 'BAR', logo: BAR_ICON, primaryColor: '#CD122D', secondaryColor: '#004D98' },
        PSG: { fullName: 'Paris Saint-Germain', shortName: 'PSG', logo: PSG_ICON, primaryColor: '#004170', secondaryColor: '#DA291C' },
        ARS: { fullName: 'Arsenal', shortName: 'ARS', logo: ARS_ICON, primaryColor: '#EF0107', secondaryColor: '#063672' },
        BAY: { fullName: 'Bayern Munich', shortName: 'BAY', logo: BAY_ICON, primaryColor: '#DC052D', secondaryColor: '#0066B2' },
        RMA: { fullName: 'Real Madrid', shortName: 'RMA', logo: RMA_ICON, primaryColor: '#FFFFFF', secondaryColor: '#00529F' },
        LEV: { fullName: 'Bayer Leverkusen', shortName: 'LEV', logo: LEV_ICON, primaryColor: '#E32221', secondaryColor: '#000000' },
        ATM: { fullName: 'Atlético Madrid', shortName: 'ATM', logo: ATM_ICON, primaryColor: '#CB3524', secondaryColor: '#172E62' },
        MCI: { fullName: 'Manchester City', shortName: 'MCI', logo: MCI_ICON, primaryColor: '#6CABDD', secondaryColor: '#1C2C5B' },
        ATA: { fullName: 'Atalanta', shortName: 'ATA', logo: ATA_ICON, primaryColor: '#1E71B8', secondaryColor: '#000000' },
        NAP: { fullName: 'SSC Napoli', shortName: 'NAP', logo: NAP_ICON, primaryColor: '#12A0D7', secondaryColor: '#003C8F' },
        ATH: { fullName: 'Athletico Bilbao', shortName: 'ATH', logo: ATH_ICON, primaryColor: '#EF1420', secondaryColor: '#000000' },
        AVL: { fullName: 'Aston Villa', shortName: 'AVL', logo: AVL_ICON, primaryColor: '#95BFE5', secondaryColor: '#7A003C' },
        BEN: { fullName: 'Benfica', shortName: 'BEN', logo: BEN_ICON, primaryColor: '#E73331', secondaryColor: '#FFFFFF' },
        SPO: { fullName: 'Sporting', shortName: 'SPO', logo: SPO_ICON, primaryColor: '#006335', secondaryColor: '#FFFFFF' },
        NFO: { fullName: 'Nottingham Forest', shortName: 'NFO', logo: NFO_ICON, primaryColor: '#DD0000', secondaryColor: '#FFFFFF' },
        BOL: { fullName: 'Bologna', shortName: 'BOL', logo: BOL_ICON, primaryColor: '#1A2F48', secondaryColor: '#AB1F3A' },
        ROM: { fullName: 'AS Roma', shortName: 'ROM', logo: ROM_ICON, primaryColor: '#A31D21', secondaryColor: '#FFD700' },
        JUV: { fullName: 'Juventus', shortName: 'JUV', logo: JUV_ICON, primaryColor: '#000000', secondaryColor: '#FFFFFF' },
    };

    /**
     * Team abbreviation array for easier reference
     */
    public static readonly TEAMS = Object.keys(TeamUtils.TEAM_INFO);

    /**
     * Get team name from the abbreviation
     * @param abbreviation The team abbreviation
     * @returns The team short name
     */
    public static getTeamFullName(abbreviation: string): string {
        return TeamUtils.TEAM_INFO[abbreviation]?.fullName || abbreviation;
    }

    /**
     * Get team primary color
     * @param abbreviation The team abbreviation
     * @returns The team primary color
     */
    public static getTeamPrimaryColor(abbreviation: string): string {
        return TeamUtils.TEAM_INFO[abbreviation]?.primaryColor || '#FFFFFF';
    }

    public static getTeamDefaultColor(): string {
        return '#FFFFFF';
    }

    public static getTeamLogo(abbreviation: string): string {
        return TeamUtils.TEAM_INFO[abbreviation]?.logo;
    }
}
