import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SSOControlSimulator } from '../src/_shared/components/sso-control-simulator/sso-control-simulator';
import { SSO_SCENARIOS, getScenarioById, getCurrentScenario } from '../src/_shared/components/sso-control-simulator/sso-scenarios';
import { SSOScenario } from '../src/_shared/components/sso-control-simulator/types';

// Mock the service
const mockService = {
    logControlToggle: jest.fn(),
    logFailureToggle: jest.fn(),
    logFirstClickInvalidTokenToggle: jest.fn(),
    logCountReset: jest.fn(),
    logScenarioToggle: jest.fn(),
    logScenarioSelection: jest.fn()
};

describe('SSO Control Simulator - Scenario Selection', () => {
    const defaultProps = {
        onToggleFailure: jest.fn(),
        onResetCount: jest.fn(),
        onToggleFirstClickInvalidToken: jest.fn(),
        onSelectScenario: jest.fn(),
        failureCount: 0,
        isFailureMode: false,
        isFirstClickInvalidTokenMode: false,
        service: mockService
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Scenario Selection UI', () => {
        it('should render scenario section with toggle button', () => {
            render(<SSOControlSimulator {...defaultProps} />);

            // Check if scenario section header is present
            expect(screen.getByText('🎯')).toBeInTheDocument();
            expect(screen.getByText('Quick Scenarios')).toBeInTheDocument();

            // Check if toggle button is present
            expect(screen.getByText('Show')).toBeInTheDocument();
        });

        it('should toggle scenario section visibility when toggle button is clicked', () => {
            render(<SSOControlSimulator {...defaultProps} />);

            // Initially scenarios should be hidden
            expect(screen.queryByText('Normal Flow')).not.toBeInTheDocument();

            // Click toggle button to show scenarios
            fireEvent.click(screen.getByText('Show'));

            // Scenarios should now be visible
            expect(screen.getByText('Normal Flow')).toBeInTheDocument();
            expect(screen.getByText('First Click Invalid Token')).toBeInTheDocument();
            expect(screen.getByText('Persistent SSO Failure')).toBeInTheDocument();

            // Click toggle button to hide scenarios
            fireEvent.click(screen.getByText('Hide'));

            // Scenarios should be hidden again
            expect(screen.queryByText('Normal Flow')).not.toBeInTheDocument();
        });

        it('should log scenario toggle events', () => {
            render(<SSOControlSimulator {...defaultProps} />);

            // Toggle scenarios on
            fireEvent.click(screen.getByText('Show'));
            expect(mockService.logScenarioToggle).toHaveBeenCalledWith(true);

            // Toggle scenarios off
            fireEvent.click(screen.getByText('Hide'));
            expect(mockService.logScenarioToggle).toHaveBeenCalledWith(false);
        });
    });

    describe('Scenario Buttons', () => {
        beforeEach(() => {
            render(<SSOControlSimulator {...defaultProps} />);
            // Show scenarios
            fireEvent.click(screen.getByText('Show'));
        });

        it('should render all predefined scenarios', () => {
            SSO_SCENARIOS.forEach(scenario => {
                expect(screen.getByText(scenario.name)).toBeInTheDocument();
                expect(screen.getByText(scenario.icon)).toBeInTheDocument();
            });
        });

        it('should display scenario descriptions as tooltips', () => {
            SSO_SCENARIOS.forEach(scenario => {
                const scenarioButton = screen.getByText(scenario.name).closest('button');
                expect(scenarioButton).toHaveAttribute('title', scenario.description);
            });
        });

        it('should highlight current scenario as selected', () => {
            // Current scenario should be "Normal Flow" by default
            const normalFlowButton = screen.getByText('Normal Flow').closest('button');
            expect(normalFlowButton).toHaveStyle('background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
        });

        it('should call onSelectScenario when a scenario is clicked', () => {
            const firstClickScenario = screen.getByText('First Click Invalid Token');
            fireEvent.click(firstClickScenario);

            expect(defaultProps.onSelectScenario).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'first-click-invalid',
                    name: 'First Click Invalid Token'
                })
            );
        });

        it('should log scenario selection events', () => {
            const persistentFailureScenario = screen.getByText('Persistent SSO Failure');
            fireEvent.click(persistentFailureScenario);

            expect(mockService.logScenarioSelection).toHaveBeenCalledWith('persistent-failure');
        });
    });

    describe('Current Scenario Indicator', () => {
        it('should display current scenario information', () => {
            render(<SSOControlSimulator {...defaultProps} />);

            expect(screen.getByText('Current:')).toBeInTheDocument();
            expect(screen.getByText('Normal Flow')).toBeInTheDocument();
            expect(screen.getByText('🟢')).toBeInTheDocument();
        });

        it('should update current scenario indicator when state changes', () => {
            const { rerender } = render(<SSOControlSimulator {...defaultProps} />);

            // Initially should show Normal Flow
            expect(screen.getByText('Normal Flow')).toBeInTheDocument();
            expect(screen.getByText('🟢')).toBeInTheDocument();

            // Update to failure mode
            rerender(<SSOControlSimulator {...defaultProps} isFailureMode={true} />);

            // Should now show Persistent SSO Failure
            expect(screen.getByText('Persistent SSO Failure')).toBeInTheDocument();
            expect(screen.getByText('🔴')).toBeInTheDocument();
        });

        it('should show correct scenario for first click invalid token mode', () => {
            render(<SSOControlSimulator {...defaultProps} isFirstClickInvalidTokenMode={true} />);

            expect(screen.getByText('First Click Invalid Token')).toBeInTheDocument();
            expect(screen.getByText('🚫')).toBeInTheDocument();
        });

        it('should show correct scenario for mixed mode', () => {
            render(<SSOControlSimulator
                {...defaultProps}
                isFailureMode={true}
                isFirstClickInvalidTokenMode={true}
                failureCount={1}
            />);

            expect(screen.getByText('Mixed Scenario')).toBeInTheDocument();
            expect(screen.getByText('🎭')).toBeInTheDocument();
        });
    });

    describe('Scenario Utility Functions', () => {
        describe('getScenarioById', () => {
            it('should return correct scenario by ID', () => {
                const scenario = getScenarioById('normal-flow');
                expect(scenario).toEqual(SSO_SCENARIOS[0]);
            });

            it('should return undefined for invalid ID', () => {
                const scenario = getScenarioById('invalid-id');
                expect(scenario).toBeUndefined();
            });
        });

        describe('getCurrentScenario', () => {
            it('should return normal flow for default state', () => {
                const scenario = getCurrentScenario(false, false, 0);
                expect(scenario.id).toBe('normal-flow');
            });

            it('should return first click invalid for first click mode', () => {
                const scenario = getCurrentScenario(false, true, 0);
                expect(scenario.id).toBe('first-click-invalid');
            });

            it('should return persistent failure for failure mode', () => {
                const scenario = getCurrentScenario(true, false, 0);
                expect(scenario.id).toBe('persistent-failure');
            });

            it('should return network timeout for failure mode with count 1', () => {
                const scenario = getCurrentScenario(true, false, 1);
                expect(scenario.id).toBe('network-timeout');
            });

            it('should return auth failed for failure mode with count 2', () => {
                const scenario = getCurrentScenario(true, false, 2);
                expect(scenario.id).toBe('auth-failed');
            });

            it('should return server error for failure mode with count 3', () => {
                const scenario = getCurrentScenario(true, false, 3);
                expect(scenario.id).toBe('server-error');
            });

            it('should return mixed scenario for both modes with count 1', () => {
                const scenario = getCurrentScenario(true, true, 1);
                expect(scenario.id).toBe('mixed-scenario');
            });

            it('should return normal flow as fallback for unmatched state', () => {
                const scenario = getCurrentScenario(true, true, 999);
                expect(scenario.id).toBe('normal-flow');
            });
        });
    });

    describe('Scenario Integration', () => {
        it('should apply scenario settings when scenario is selected', () => {
            const onSelectScenario = jest.fn();
            render(<SSOControlSimulator {...defaultProps} onSelectScenario={onSelectScenario} />);

            // Show scenarios
            fireEvent.click(screen.getByText('Show'));

            // Select server error scenario
            fireEvent.click(screen.getByText('Server Error'));

            expect(onSelectScenario).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'server-error',
                    settings: {
                        isFailureMode: true,
                        isFirstClickInvalidTokenMode: false,
                        failureCount: 3
                    }
                })
            );
        });

        it('should maintain existing functionality while adding scenarios', () => {
            render(<SSOControlSimulator {...defaultProps} />);

            // Test that existing buttons still work
            fireEvent.click(screen.getByText(/Enable SSO Failures/));
            expect(defaultProps.onToggleFailure).toHaveBeenCalled();

            fireEvent.click(screen.getByText(/Enable First Click Invalid Token/));
            expect(defaultProps.onToggleFirstClickInvalidToken).toHaveBeenCalled();

            fireEvent.click(screen.getByText('Reset Count'));
            expect(defaultProps.onResetCount).toHaveBeenCalled();
        });
    });

    describe('Accessibility and UX', () => {
        it('should have proper button roles and labels', () => {
            render(<SSOControlSimulator {...defaultProps} />);

            // Show scenarios
            fireEvent.click(screen.getByText('Show'));

            // Check scenario buttons have proper accessibility
            SSO_SCENARIOS.forEach(scenario => {
                const button = screen.getByText(scenario.name).closest('button');
                expect(button).toHaveAttribute('title', scenario.description);
            });
        });

        it('should provide visual feedback for scenario selection', () => {
            render(<SSOControlSimulator {...defaultProps} />);

            // Show scenarios
            fireEvent.click(screen.getByText('Show'));

            // Check that current scenario is visually distinct
            const normalFlowButton = screen.getByText('Normal Flow').closest('button');
            expect(normalFlowButton).toHaveStyle('background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
        });

        it('should maintain responsive design for scenario grid', () => {
            render(<SSOControlSimulator {...defaultProps} />);

            // Show scenarios
            fireEvent.click(screen.getByText('Show'));

            const scenarioGrid = screen.getByText('Normal Flow').closest('div')?.parentElement;
            expect(scenarioGrid).toHaveStyle('display: grid');
            expect(scenarioGrid).toHaveStyle('grid-template-columns: repeat(auto-fit, minmax(120px, 1fr))');
        });
    });
}); 