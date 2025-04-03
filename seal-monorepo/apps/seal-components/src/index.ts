if (typeof window !== 'undefined' && window._ImageServerURL) {
  const publicPath = `${window._ImageServerURL}/Scripts/seal/seal-components-nx/`;
  __webpack_public_path__ = publicPath;
}


import SabaGamesGroup from '@SabaGamesGroup';
import HotLeagueWall from '@HotLeagueWall';

// Original names
const SealComponents = {
  SabaGamesGroup,
  HotLeagueWall
}

// Aliases for components to support renaming


// Export both original and alias names for flexibility
export {
  SabaGamesGroup,
  HotLeagueWall
};
