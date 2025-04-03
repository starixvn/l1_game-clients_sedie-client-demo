import * as gc from '@sg/sg-game-client';
import classNames from 'classnames';
import style from './league-dropdown.module.scss';
import { useAppContext } from '../../../appProvider';
import { VIVA88_SITE_ID } from '../../../../constant/app';

export enum DropdownType {
    LEAGUE = 'league',
    MATCH = 'match',
}

type DropdownProps = {
    leagueToogle: boolean;
    updateLeagueToogle: (leagueToogle: boolean) => void;
    dropdownType: DropdownType;
};


export const LeagueDropdown = ({ dropdownType, leagueToogle, updateLeagueToogle }: DropdownProps) => {
    const sabaGamesHeader = 'SABA.games';
    const vGamingHeader = 'Vgaming';
    const { siteId } = useAppContext();
    const headerText = siteId === VIVA88_SITE_ID ? sabaGamesHeader : vGamingHeader;

    const handleToggle = () => {
        updateLeagueToogle(!leagueToogle);
    };

    const renderGameLogo = (siteId: string) => {
        return siteId === VIVA88_SITE_ID ? (
            <div className={style['saba-games-logo']} />
        ) : (
            <div className={style['vgaming-logo']} />
        );
    };

    return (
        <div className={classNames(style['container'], 'c-odds-table')}>
            <div
                className={classNames(style['header'], {
                    [style['league-header']]: dropdownType === DropdownType.LEAGUE,
                    [style['match-header']]: dropdownType === DropdownType.MATCH,
                })}
                onClick={handleToggle}
            >
                <div
                    className={classNames(
                        style['dropdown-btn'],
                        style[leagueToogle ? '' : 'collapsed'],
                        style[`${dropdownType}-dropdown-btn`],
                        // 'c-odds-table__event',
                    )}
                >
                    <div className={style['toggle-arrow-svg']}></div>
                </div>
                <div className={style['league-content']}>
                    <div className={style['game-image']}>
                        {renderGameLogo(siteId)}
                    </div>
                    <span className={style['league-header-text']}>{headerText}</span>
                </div>
            </div>
        </div>
    );
};
