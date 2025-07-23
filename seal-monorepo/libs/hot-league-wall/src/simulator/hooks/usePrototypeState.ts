import { useState } from 'react';
import { PrototypeState } from '../types';

export const usePrototypeState = (): PrototypeState => {
    const [playButtonClickCount, setPlayButtonClickCount] = useState(0);

    return {
        playButtonClickCount,
        setPlayButtonClickCount
    };
}; 