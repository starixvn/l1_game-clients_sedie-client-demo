import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RNGSoccerStaticPrototype from '../../../../../src/games/saba-club/rng-soccer/prototype/rng-soccer-static-prototype';

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});

afterAll(() => {
    console.error = originalError;
});

describe('Simple Token Callback Test', () => {
    it('should handle play button click with async callback', async () => {
        const mockOnPlayButtonClick = jest.fn().mockResolvedValue(undefined);

        render(
            <RNGSoccerStaticPrototype onPlayButtonClick={mockOnPlayButtonClick} />
        );

        // Initially shows play button
        expect(screen.getByText('Play Now')).toBeInTheDocument();

        // Click play button
        fireEvent.click(screen.getByText('Play Now'));

        // Should call the callback
        await waitFor(() => {
            expect(mockOnPlayButtonClick).toHaveBeenCalledTimes(1);
        });

        // Should hide play button after successful click
        await waitFor(() => {
            expect(screen.queryByText('Play Now')).not.toBeInTheDocument();
        });
    });

    it('should handle play button click error gracefully', async () => {
        const mockOnPlayButtonClick = jest.fn().mockRejectedValue(new Error('Test error'));

        render(
            <RNGSoccerStaticPrototype onPlayButtonClick={mockOnPlayButtonClick} />
        );

        // Initially shows play button
        expect(screen.getByText('Play Now')).toBeInTheDocument();

        // Click play button
        fireEvent.click(screen.getByText('Play Now'));

        // Should call the callback
        await waitFor(() => {
            expect(mockOnPlayButtonClick).toHaveBeenCalledTimes(1);
        });

        // Should re-show play button on error
        await waitFor(() => {
            expect(screen.getByText('Play Now')).toBeInTheDocument();
        });
    });
}); 