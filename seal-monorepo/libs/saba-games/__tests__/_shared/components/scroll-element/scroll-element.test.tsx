import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScrollElement from '../../../../src/_shared/components/scroll-element';

describe('ScrollElement', () => {
    const mockRef = React.createRef<HTMLDivElement>();
    const mockChildren = <div>Test Content</div>;
    const mockClassName = 'test-class';

    beforeEach(() => {
        // Mock getBoundingClientRect
        Element.prototype.getBoundingClientRect = jest.fn(() => ({
            width: 100,
            height: 100,
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            x: 0,
            y: 0,
            toJSON: () => { }
        }));
    });

    it('renders without crashing', () => {
        render(
            <ScrollElement className={mockClassName} refData={mockRef}>
                {mockChildren}
            </ScrollElement>
        );
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies correct className', () => {
        const { container } = render(
            <ScrollElement className={mockClassName} refData={mockRef}>
                {mockChildren}
            </ScrollElement>
        );
        expect(container.firstChild).toHaveClass(mockClassName);
    });

    it('handles mouse down event correctly', () => {
        const { container } = render(
            <ScrollElement className={mockClassName} refData={mockRef}>
                {mockChildren}
            </ScrollElement>
        );

        // Mock scrollLeft and offsetLeft
        Object.defineProperty(mockRef.current, 'scrollLeft', { value: 100, writable: true });
        Object.defineProperty(mockRef.current, 'offsetLeft', { value: 50, writable: true });

        fireEvent.mouseDown(container.firstChild!, { pageX: 100 });

        // Check if cursor style changed
        expect(container.firstChild).toHaveStyle({ cursor: 'grabbing' });
    });

    it('handles mouse leave event correctly', () => {
        const { container } = render(
            <ScrollElement className={mockClassName} refData={mockRef}>
                {mockChildren}
            </ScrollElement>
        );

        // First trigger mouse down to set dragging state
        fireEvent.mouseDown(container.firstChild!, { pageX: 100 });
        // Then trigger mouse leave
        fireEvent.mouseLeave(container.firstChild!);

        // Check if cursor style changed back
        expect(container.firstChild).toHaveStyle({ cursor: 'grab' });
    });

    it('handles mouse up event correctly', () => {
        const { container } = render(
            <ScrollElement className={mockClassName} refData={mockRef}>
                {mockChildren}
            </ScrollElement>
        );

        // First trigger mouse down to set dragging state
        fireEvent.mouseDown(container.firstChild!, { pageX: 100 });
        // Then trigger mouse up
        fireEvent.mouseUp(container.firstChild!);

        // Check if cursor style changed back
        expect(container.firstChild).toHaveStyle({ cursor: 'grab' });
    });
}); 
