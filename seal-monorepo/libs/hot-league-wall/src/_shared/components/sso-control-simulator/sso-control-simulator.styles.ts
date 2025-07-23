import { ISSOSimulatorStyles } from './types';

/**
 * SSO Control Simulator Styles Class
 * 
 * Single Responsibility: Manages all styling concerns
 * Open/Closed: Extensible through inheritance or composition
 * Dependency Inversion: Implements ISSOSimulatorStyles interface
 */
export class SSOControlSimulatorStyles implements ISSOSimulatorStyles {
    /**
     * CSS animations for the component
     */
    get animations(): string {
        return `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
            }
            
            .sso-control-pulse {
                animation: pulse 2s infinite;
            }
        `;
    }

    /**
     * Main container styles
     */
    get container(): React.CSSProperties {
        return {
            position: 'relative',
            background: 'transparent',
            color: 'white',
            fontSize: '13px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        };
    }

    /**
     * Header container styles
     */
    get header(): React.CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
        };
    }

    /**
     * Title container styles
     */
    get titleContainer(): React.CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600',
            fontSize: '14px'
        };
    }

    /**
     * Status icon styles based on failure mode
     */
    statusIcon(isFailureMode: boolean): React.CSSProperties {
        return {
            fontSize: '16px',
            color: isFailureMode ? '#ff6b6b' : '#51cf66'
        };
    }

    /**
     * Toggle button styles
     */
    get toggleButton(): React.CSSProperties {
        return {
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
        };
    }

    /**
     * Toggle icon styles
     */
    get toggleIcon(): React.CSSProperties {
        return {
            fontSize: '10px'
        };
    }

    /**
     * Content container styles
     */
    get content(): React.CSSProperties {
        return {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: '1',
            overflowY: 'auto',
            paddingRight: '8px'
        };
    }

    /**
     * Status grid styles
     */
    get statusGrid(): React.CSSProperties {
        return {
            display: 'grid',
            gridTemplateColumns: '150px 150px',
            gap: '12px',
            marginBottom: '8px',
            justifyContent: 'center'
        };
    }

    /**
     * Status card styles
     */
    get statusCard(): React.CSSProperties {
        return {
            background: 'rgba(255,255,255,0.05)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
            width: '150px',
            minWidth: '150px',
            maxWidth: '150px'
        };
    }

    /**
     * Status label styles
     */
    get statusLabel(): React.CSSProperties {
        return {
            fontSize: '11px',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '4px'
        };
    }

    /**
     * Status value styles based on failure mode
     */
    statusValue(isFailureMode: boolean): React.CSSProperties {
        return {
            fontSize: '13px',
            fontWeight: '600',
            color: isFailureMode ? '#ff6b6b' : '#51cf66',
            animation: isFailureMode ? 'pulse 2s infinite' : 'none',
            minWidth: '120px',
            display: 'inline-block'
        };
    }

    /**
     * Button container styles
     */
    get buttonContainer(): React.CSSProperties {
        return {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        };
    }

    /**
     * Primary button styles based on failure mode
     */
    primaryButton(isFailureMode: boolean): React.CSSProperties {
        return {
            background: isFailureMode
                ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: isFailureMode
                ? '0 4px 12px rgba(220, 53, 69, 0.3)'
                : '0 4px 12px rgba(40, 167, 69, 0.3)'
        };
    }

    /**
     * Button icon styles
     */
    get buttonIcon(): React.CSSProperties {
        return {
            fontSize: '14px'
        };
    }

    /**
     * Instructions container styles
     */
    get instructions(): React.CSSProperties {
        return {
            background: 'rgba(255,255,255,0.05)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.8)',
            lineHeight: '1.4'
        };
    }

    /**
     * Instructions header styles
     */
    get instructionsHeader(): React.CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '6px',
            fontWeight: '600'
        };
    }

    /**
     * Instructions icon styles
     */
    get instructionsIcon(): React.CSSProperties {
        return {
            fontSize: '12px'
        };
    }

    /**
     * Instructions text styles
     */
    get instructionsText(): React.CSSProperties {
        return {
            fontSize: '11px',
            lineHeight: '1.4',
            wordBreak: 'break-word',
            whiteSpace: 'normal',
            width: '100%'
        };
    }

    /**
     * Warning text styles
     */
    get warningText(): React.CSSProperties {
        return {
            color: '#ff6b6b',
            fontWeight: '600'
        };
    }

    /**
     * Scenario section styles
     */
    get scenarioSection(): React.CSSProperties {
        return {
            background: 'rgba(255,255,255,0.03)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '12px'
        };
    }

    /**
     * Scenario section header styles
     */
    get scenarioSectionHeader(): React.CSSProperties {
        return {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '10px',
            fontSize: '12px',
            fontWeight: '600',
            color: 'rgba(255,255,255,0.9)'
        };
    }

    /**
     * Scenario grid styles
     */
    get scenarioGrid(): React.CSSProperties {
        return {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '8px',
            marginBottom: '8px'
        };
    }

    /**
     * Scenario button styles
     */
    scenarioButton(isActive: boolean, isSelected: boolean): React.CSSProperties {
        return {
            background: isSelected
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : isActive
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(255,255,255,0.05)',
            color: 'white',
            border: isSelected
                ? '1px solid rgba(255,255,255,0.3)'
                : '1px solid rgba(255,255,255,0.1)',
            padding: '10px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '8px',
            textAlign: 'left',
            minHeight: 'auto',
            justifyContent: 'flex-start',
            opacity: isActive ? 1 : 0.6,
            width: '100%'
        };
    }

    /**
     * Scenario icon styles
     */
    get scenarioIcon(): React.CSSProperties {
        return {
            fontSize: '16px',
            flexShrink: 0
        };
    }

    /**
     * Scenario name styles
     */
    get scenarioName(): React.CSSProperties {
        return {
            fontSize: '12px',
            fontWeight: '500',
            lineHeight: '1.3',
            flex: 1
        };
    }

    /**
     * Current scenario indicator styles
     */
    get currentScenarioIndicator(): React.CSSProperties {
        return {
            background: 'rgba(255,255,255,0.1)',
            padding: '8px 10px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            marginBottom: '8px'
        };
    }

    /**
     * Current scenario icon styles
     */
    get currentScenarioIcon(): React.CSSProperties {
        return {
            fontSize: '14px'
        };
    }

    /**
     * Current scenario text styles
     */
    get currentScenarioText(): React.CSSProperties {
        return {
            flex: 1,
            fontSize: '11px',
            fontWeight: '500'
        };
    }

    /**
     * Divider styles
     */
    get divider(): React.CSSProperties {
        return {
            height: '1px',
            background: 'rgba(255,255,255,0.1)',
            margin: '12px 0',
            width: '100%'
        };
    }

    /**
     * Handle button hover effects
     */
    handleButtonHover(element: HTMLElement, isHovering: boolean): void {
        if (isHovering) {
            element.style.background = 'rgba(255,255,255,0.2)';
            element.style.transform = 'scale(1.05)';
        } else {
            element.style.background = 'rgba(255,255,255,0.1)';
            element.style.transform = 'scale(1)';
        }
    }

    /**
     * Handle primary button hover effects
     */
    handlePrimaryButtonHover(element: HTMLElement, isFailureMode: boolean, isHovering: boolean): void {
        if (isHovering) {
            element.style.transform = 'translateY(-2px)';
            element.style.boxShadow = isFailureMode
                ? '0 6px 16px rgba(220, 53, 69, 0.4)'
                : '0 6px 16px rgba(40, 167, 69, 0.4)';
        } else {
            element.style.transform = 'translateY(0)';
            element.style.boxShadow = isFailureMode
                ? '0 4px 12px rgba(220, 53, 69, 0.3)'
                : '0 4px 12px rgba(40, 167, 69, 0.3)';
        }
    }
} 