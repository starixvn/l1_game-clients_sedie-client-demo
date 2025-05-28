import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LeagueDropdown, DropdownType } from 'libs/saba-games/src/_shared/components/league-dropdown';
import { useAppContext } from 'libs/saba-games/src/appProvider';
import { VIVA88_SITE_ID } from 'libs/saba-games/constant/app';

// Mock styles and App Context
jest.mock('libs/saba-games/src/_shared/components/league-dropdown/league-dropdown.module.scss', () => ({
  container: 'container',
  header: 'header',
  'league-header': 'league-header',
  'match-header': 'match-header',
  'dropdown-btn': 'dropdown-btn',
  collapsed: 'collapsed',
  'league-dropdown-btn': 'league-dropdown-btn',
  'match-dropdown-btn': 'match-dropdown-btn',
  'toggle-arrow-svg': 'toggle-arrow-svg',
  'league-content': 'league-content',
  'game-image': 'game-image',
  'saba-games-logo': 'saba-games-logo',
  'vgaming-logo': 'vgaming-logo',
  'league-header-text': 'league-header-text'
}));

jest.mock('libs/saba-games/src/appProvider', () => ({
  useAppContext: jest.fn(),
}));

describe('LeagueDropdown', () => {
  const mockUpdateToggle = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  const setup = (overrides: Partial<React.ComponentProps<typeof LeagueDropdown>> = {}, siteId = 'DEFAULT_SITE') => {
    (useAppContext as jest.Mock).mockReturnValue({ siteId });

    return render(
      <LeagueDropdown
        dropdownType={DropdownType.LEAGUE}
        leagueToogle={true}
        updateLeagueToogle={mockUpdateToggle}
        {...overrides}
      />
    );
  };

  // it('renders correct header for VIVA88 site', () => {
  //   const { getByText } = setup({}, VIVA88_SITE_ID);
  //   expect(getByText('SABA.games')).toBeInTheDocument();
  // });

  it('renders correct header for other sites', () => {
    const { getByText } = setup({}, 'OTHER_SITE');
    expect(getByText('Vgaming')).toBeInTheDocument();
  });

  // it('renders the correct logo for VIVA88', () => {
  //   const { container } = setup({}, VIVA88_SITE_ID);
  //   expect(container.querySelector('.saba-games-logo')).toBeInTheDocument();
  // });

  it('renders the correct logo for other sites', () => {
    const { container } = setup({}, 'OTHER_SITE');
    expect(container.querySelector('.vgaming-logo')).toBeInTheDocument();
  });

  it('applies correct header class for LEAGUE type', () => {
    const { container } = setup({ dropdownType: DropdownType.LEAGUE });
    const header = container.querySelector('.header');
    expect(header).toHaveClass('league-header');
  });

  it('applies correct header class for MATCH type', () => {
    const { container } = setup({ dropdownType: DropdownType.MATCH });
    const header = container.querySelector('.header');
    expect(header).toHaveClass('match-header');
  });

  it('calls updateLeagueToogle when header is clicked', () => {
    const { container } = setup({ leagueToogle: true });
    const header = container.querySelector('.header');
    if (header) {
      fireEvent.click(header);
      expect(mockUpdateToggle).toHaveBeenCalledWith(false);
    }
  });

  it('applies collapsed class when leagueToogle is false', () => {
    const { container } = setup({ leagueToogle: false });
    const dropdownBtn = container.querySelector('.dropdown-btn');
    expect(dropdownBtn).toHaveClass('collapsed');
  });
});
