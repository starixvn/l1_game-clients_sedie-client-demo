import * as gc from '@sg/sg-game-client';
import classNames from 'classnames';
import styles from './league-tab-dropdown.module.scss';
import { useAppContext } from '../../../../appProvider';
import { VIVA88_SITE_ID } from '../../../../../constant/app';

export enum DropdownType {
    LEAGUE = 'league',
    MATCH = 'match',
}

type DropdownProps = {
    leagueToogle: boolean;
    updateLeagueToogle: (leagueToogle: boolean) => void;
    dropdownType: DropdownType;
};


export const LeagueTabDropdown = ({ dropdownType, leagueToogle, updateLeagueToogle }: DropdownProps) => {
    const sabaGamesHeader = 'SABA.games';
    const vGamingHeader = 'Vgaming';
    const { siteId } = useAppContext();
    const headerText = siteId === VIVA88_SITE_ID ? sabaGamesHeader : vGamingHeader;

    const handleToggle = () => {
        updateLeagueToogle(!leagueToogle);
    };

    const renderGameLogo = (siteId: string) => {
        return siteId === VIVA88_SITE_ID ? (
            <div className={styles['saba-games-logo']} />
        ) : (
            <div className={styles['vgaming-logo']} />
        );
    };

    return (
        <div className={classNames(styles['container'], 'c-odds-table')}>
            <div
                className={classNames(styles['header'], {
                    [styles['league-header']]: dropdownType === DropdownType.LEAGUE,
                    [styles['match-header']]: dropdownType === DropdownType.MATCH,
                })}
                onClick={handleToggle}
            >
                <div
                    className={classNames(
                        styles['dropdown-btn'],
                        styles[leagueToogle ? '' : 'collapsed'],
                        styles[`${dropdownType}-dropdown-btn`],
                        // 'c-odds-table__event',
                    )}
                >
                    <div className={styles['toggle-arrow-svg']}></div>
                </div>
                <div className={styles['league-content']}>
                    <div className={styles['game-image']}>
                        {renderGameLogo(siteId)}
                    </div>
                    <span className={styles['league-header-text']}>{headerText}</span>
                </div>
            </div>
        </div>
    );
};
