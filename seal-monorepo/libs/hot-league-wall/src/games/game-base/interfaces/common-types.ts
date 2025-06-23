import { Component } from 'react';
import { IGameBaseState } from './index';
import { GameBaseProps } from '../type';

/**
 * Represents the common interface for a GameBase component 
 * used by services to avoid circular dependencies
 */
export interface GameBaseComponent extends Component<GameBaseProps, IGameBaseState> {
    // Connection related
    onVisibilityChange: () => void;
    connectToServiceGateway: () => void;
    terminateConnection: () => void;
    resetStateWhenReconnect: () => void;

    // UI related
    setState: (state: any) => void;
    state: IGameBaseState;
} 