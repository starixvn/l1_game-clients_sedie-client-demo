import * as ScoreboardIndex from '../../../../../src/games/saba-club/fish-prawn-crab/scoreboard/index';
import FishPrawnCrabScoreBoard from '../../../../../src/games/saba-club/fish-prawn-crab/scoreboard/fish-prawn-crab-scoreboard';

describe('Scoreboard Index', () => {
    it('should export the FishPrawnCrabScoreBoard component', () => {
        // Arrange & Act & Assert
        expect(ScoreboardIndex.FishPrawnCrabScoreBoard).toBe(FishPrawnCrabScoreBoard);
    });
}); 