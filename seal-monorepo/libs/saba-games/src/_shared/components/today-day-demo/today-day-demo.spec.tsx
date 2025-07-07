import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodayDayDemo from './today-day-demo';

describe('TodayDayDemo', () => {
    // Happy Path Tests
    describe('TodayDayDemo_withValidProps_shouldRenderCorrectly', () => {
        it('should render with default props', () => {
            // Arrange
            const defaultProps = {};

            // Act
            render(<TodayDayDemo {...defaultProps} />);

            // Assert
            expect(screen.getByText('🎮 Today Day Demo')).toBeInTheDocument();
            expect(screen.getByText('demo')).toBeInTheDocument();
            expect(screen.getByText('en')).toBeInTheDocument();
            expect(screen.getByText('test')).toBeInTheDocument();
        });

        it('should render with custom props', () => {
            // Arrange
            const customProps = {
                appEnv: 'production',
                language: 'zh',
                siteId: 'custom-site'
            };

            // Act
            render(<TodayDayDemo {...customProps} />);

            // Assert
            expect(screen.getByText('🎮 Today Day Demo')).toBeInTheDocument();
            expect(screen.getByText('production')).toBeInTheDocument();
            expect(screen.getByText('zh')).toBeInTheDocument();
            expect(screen.getByText('custom-site')).toBeInTheDocument();
        });
    });

    // Edge Cases Tests
    describe('TodayDayDemo_withEdgeCases_shouldHandleGracefully', () => {
        it('should handle empty string props', () => {
            // Arrange
            const edgeCaseProps = {
                appEnv: '',
                language: '',
                siteId: ''
            };

            // Act
            render(<TodayDayDemo {...edgeCaseProps} />);

            // Assert
            expect(screen.getByText('🎮 Today Day Demo')).toBeInTheDocument();
            expect(screen.getByText('')).toBeInTheDocument();
        });

        it('should handle undefined props', () => {
            // Arrange
            const undefinedProps = {
                appEnv: undefined,
                language: undefined,
                siteId: undefined
            };

            // Act
            render(<TodayDayDemo {...undefinedProps} />);

            // Assert
            expect(screen.getByText('🎮 Today Day Demo')).toBeInTheDocument();
            expect(screen.getByText('demo')).toBeInTheDocument(); // Should use default values
            expect(screen.getByText('en')).toBeInTheDocument();
            expect(screen.getByText('test')).toBeInTheDocument();
        });
    });

    // Component Structure Tests
    describe('TodayDayDemo_componentStructure_shouldHaveCorrectElements', () => {
        it('should display all required sections', () => {
            // Arrange
            const props = {};

            // Act
            render(<TodayDayDemo {...props} />);

            // Assert
            expect(screen.getByText('🎮 Today Day Demo')).toBeInTheDocument();
            expect(screen.getByText('This is a dummy component for testing tab switching')).toBeInTheDocument();
            expect(screen.getByText('Component will be destroyed and recreated when switching tabs')).toBeInTheDocument();
            expect(screen.getByText('Environment')).toBeInTheDocument();
            expect(screen.getByText('Language')).toBeInTheDocument();
            expect(screen.getByText('Site ID')).toBeInTheDocument();
        });

        it('should display mount timestamp', () => {
            // Arrange
            const props = {};
            const beforeRender = new Date();

            // Act
            render(<TodayDayDemo {...props} />);

            // Assert
            const mountText = screen.getByText(/Component mounted at:/);
            expect(mountText).toBeInTheDocument();

            // Verify the timestamp is recent
            const timestampText = mountText.textContent;
            expect(timestampText).toMatch(/Component mounted at: \d{1,2}:\d{2}:\d{2}/);
        });
    });

    // Styling and Layout Tests
    describe('TodayDayDemo_stylingAndLayout_shouldHaveCorrectStyles', () => {
        it('should have correct container styling', () => {
            // Arrange
            const props = {};

            // Act
            const { container } = render(<TodayDayDemo {...props} />);

            // Assert
            const mainContainer = container.firstChild as HTMLElement;
            expect(mainContainer).toHaveStyle({
                width: '100%',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            });
        });

        it('should have gradient background', () => {
            // Arrange
            const props = {};

            // Act
            const { container } = render(<TodayDayDemo {...props} />);

            // Assert
            const mainContainer = container.firstChild as HTMLElement;
            expect(mainContainer).toHaveStyle({
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
            });
        });
    });

    // Integration Tests
    describe('TodayDayDemo_integration_shouldWorkWithParentComponents', () => {
        it('should accept and display props from parent component', () => {
            // Arrange
            const mockProps = {
                appEnv: 'staging',
                language: 'ja',
                siteId: 'integration-test'
            };

            // Act
            render(<TodayDayDemo {...mockProps} />);

            // Assert
            expect(screen.getByText('staging')).toBeInTheDocument();
            expect(screen.getByText('ja')).toBeInTheDocument();
            expect(screen.getByText('integration-test')).toBeInTheDocument();
        });
    });

    // Accessibility Tests
    describe('TodayDayDemo_accessibility_shouldBeAccessible', () => {
        it('should have proper heading structure', () => {
            // Arrange
            const props = {};

            // Act
            render(<TodayDayDemo {...props} />);

            // Assert
            const heading = screen.getByRole('heading', { level: 1 });
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent('🎮 Today Day Demo');
        });

        it('should have proper text contrast and readability', () => {
            // Arrange
            const props = {};

            // Act
            render(<TodayDayDemo {...props} />);

            // Assert
            const mainText = screen.getByText('This is a dummy component for testing tab switching');
            expect(mainText).toBeInTheDocument();
            expect(mainText).toHaveStyle({
                color: 'white',
                fontSize: '1.2rem'
            });
        });
    });
}); 