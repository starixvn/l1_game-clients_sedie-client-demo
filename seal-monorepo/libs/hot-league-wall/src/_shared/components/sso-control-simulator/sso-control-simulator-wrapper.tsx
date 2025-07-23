import React from 'react';
import { shouldShowSSOControls } from '../../utils/sso-controls-config';

/**
 * SSO Control Simulator Wrapper
 * 
 * This component wraps the production App component and provides SSO testing functionality
 * when SSO controls are enabled. In production, this component is not rendered.
 * 
 * When SSO controls are enabled, the parent component (preview.tsx) will provide
 * the necessary SSO-related props to the App component.
 */
export interface SSOControlSimulatorWrapperProps {
    children: React.ReactNode;
}

export const SSOControlSimulatorWrapper: React.FC<SSOControlSimulatorWrapperProps> = ({
    children
}) => {
    // Check if SSO controls should be shown
    const showSSOControls = shouldShowSSOControls();

    // If SSO controls are not enabled, just render children
    if (!showSSOControls) {
        return <>{children}</>;
    }

    // If SSO controls are enabled, the parent component will provide SSO-related props
    // to the children, so we just render them as-is
    return <>{children}</>;
};

export default SSOControlSimulatorWrapper; 