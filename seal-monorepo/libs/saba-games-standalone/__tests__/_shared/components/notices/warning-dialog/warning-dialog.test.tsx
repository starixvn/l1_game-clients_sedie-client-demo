import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WarningDialog from 'libs/saba-games/src/_shared/components/notices/warning-dialog';

// Mock the SCSS module
jest.mock('libs/saba-games/src/_shared/components/notices/warning-dialog/warning.module.scss', () => ({
    'wrapper-dialog': 'mock-wrapper-dialog',
    'warning-container': 'mock-warning-container'
}));

describe('WarningDialog', () => {
    const mockChildren = <div>Test Warning Content</div>;

    it('renders without crashing', () => {
        render(
            <WarningDialog>
                {mockChildren}
            </WarningDialog>
        );
        expect(screen.getByText('Test Warning Content')).toBeInTheDocument();
    });

    it('applies correct wrapper class', () => {
        const { container } = render(
            <WarningDialog>
                {mockChildren}
            </WarningDialog>
        );
        const wrapper = container.firstChild;
        expect(wrapper).toHaveClass('mock-wrapper-dialog');
    });

    it('applies correct warning container class', () => {
        const { container } = render(
            <WarningDialog>
                {mockChildren}
            </WarningDialog>
        );
        const warningContainer = container.querySelector('.mock-warning-container');
        expect(warningContainer).toBeInTheDocument();
    });

    it('renders children inside warning container', () => {
        const { container } = render(
            <WarningDialog>
                {mockChildren}
            </WarningDialog>
        );
        const warningContainer = container.querySelector('.mock-warning-container');
        expect(warningContainer).toContainElement(screen.getByText('Test Warning Content'));
    });

    it('renders with correct structure', () => {
        const { container } = render(
            <WarningDialog>
                {mockChildren}
            </WarningDialog>
        );
        const wrapper = container.firstChild;
        expect(wrapper).toHaveClass('mock-wrapper-dialog');
        expect(wrapper?.firstChild).toHaveClass('mock-warning-container');
    });

    it('renders with empty children', () => {
        const { container } = render(
            <WarningDialog>
                {null}
            </WarningDialog>
        );
        const warningContainer = container.querySelector('.mock-warning-container');
        expect(warningContainer).toBeInTheDocument();
    });

    it('renders with multiple children', () => {
        const multipleChildren = (
            <>
                <div>Child 1</div>
                <div>Child 2</div>
            </>
        );
        const { container } = render(
            <WarningDialog>
                {multipleChildren}
            </WarningDialog>
        );
        expect(screen.getByText('Child 1')).toBeInTheDocument();
        expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('has correct ref attached to wrapper', () => {
        const { container } = render(
            <WarningDialog>
                {mockChildren}
            </WarningDialog>
        );
        const wrapper = container.firstChild as HTMLDivElement;
        expect(wrapper).toBeInstanceOf(HTMLDivElement);
    });
}); 
