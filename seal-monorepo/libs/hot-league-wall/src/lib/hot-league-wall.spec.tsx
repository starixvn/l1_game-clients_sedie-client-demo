import { render } from '@testing-library/react';

import HotLeagueWall from './hot-league-wall';

describe('HotLeagueWall', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<HotLeagueWall />);
    expect(baseElement).toBeTruthy();
  });
});
