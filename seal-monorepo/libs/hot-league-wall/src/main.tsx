import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { HotLeagueWall } from './lib/hot-league-wall';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <HotLeagueWall />
  </StrictMode>
);