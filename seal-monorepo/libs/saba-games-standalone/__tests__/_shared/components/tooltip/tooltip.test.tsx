import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Tooltip from 'libs/saba-games/src/_shared/components/tooltip/tooltip';

// Mock the SCSS module
jest.mock('libs/saba-games/src/_shared/components/tooltip/tooltip.module.scss', () => ({
    'tooltip': 'mock-tooltip',
    'tooltip-content': 'mock-tooltip-content',
    'tooltip-title': 'mock-tooltip-title',
    'tooltip-body': 'mock-tooltip-body',
    'tooltip-item': 'mock-tooltip-item',
    'tooltip-points': 'mock-tooltip-points'
}));

describe('Tooltip', () => {
    const mockChildren = <div>Test Content</div>;
    const mockRoundId = 123;
    const mockClassName = 'custom-class';

    it('renders without crashing', () => {
        render(
            <Tooltip>
                {mockChildren}
            </Tooltip>
        );
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders with roundId', () => {
        render(
            <Tooltip roundId={mockRoundId}>
                {mockChildren}
            </Tooltip>
        );
        expect(screen.getByText(`#${mockRoundId}`)).toBeInTheDocument();
    });

    it('renders without roundId', () => {
        render(
            <Tooltip>
                {mockChildren}
            </Tooltip>
        );
        expect(screen.queryByText(/#\d+/)).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(
            <Tooltip className={mockClassName}>
                {mockChildren}
            </Tooltip>
        );
        expect(container.firstChild).toHaveClass('mock-tooltip');
        expect(container.firstChild).toHaveClass(mockClassName);
    });

    it('renders with correct structure', () => {
        const { container } = render(
            <Tooltip roundId={mockRoundId}>
                {mockChildren}
            </Tooltip>
        );

        // Check tooltip structure
        const tooltip = container.firstChild;
        expect(tooltip).toHaveClass('mock-tooltip');

        // Check tooltip content
        const tooltipContent = tooltip?.firstChild;
        expect(tooltipContent).toHaveClass('mock-tooltip-content');

        // Check tooltip title
        const tooltipTitle = tooltipContent?.firstChild;
        expect(tooltipTitle).toHaveClass('mock-tooltip-title');
        expect(tooltipTitle).toHaveTextContent(`#${mockRoundId}`);

        // Check tooltip body
        const tooltipBody = tooltipTitle?.nextSibling;
        expect(tooltipBody).toHaveClass('mock-tooltip-body');

        // Check tooltip item
        const tooltipItem = tooltipBody?.firstChild;
        expect(tooltipItem).toHaveClass('mock-tooltip-item');

        // Check tooltip points
        const tooltipPoints = tooltipItem?.firstChild;
        expect(tooltipPoints).toHaveClass('mock-tooltip-points');
        expect(tooltipPoints).toContainElement(screen.getByText('Test Content'));
    });

    it('renders with empty children', () => {
        const { container } = render(
            <Tooltip>
                {null}
            </Tooltip>
        );
        const tooltipPoints = container.querySelector('.mock-tooltip-points');
        expect(tooltipPoints).toBeInTheDocument();
        expect(tooltipPoints).toBeEmptyDOMElement();
    });

    it('renders with multiple children', () => {
        const multipleChildren = (
            <>
                <div>Child 1</div>
                <div>Child 2</div>
            </>
        );
        render(
            <Tooltip>
                {multipleChildren}
            </Tooltip>
        );
        expect(screen.getByText('Child 1')).toBeInTheDocument();
        expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
}); 
