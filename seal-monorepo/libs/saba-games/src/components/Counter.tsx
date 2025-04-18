/**
 * A simple counter component
 */
import React, { useState } from 'react';

interface CounterProps {
    initialCount?: number;
}

export const Counter: React.FC<CounterProps> = ({ initialCount = 0 }) => {
    const [count, setCount] = useState(initialCount);

    const increment = () => setCount(count + 1);
    const decrement = () => setCount(count - 1);
    const reset = () => setCount(0);

    return (
        <div>
            <h1 data-testid="count">Count: {count}</h1>
            <button onClick={increment} data-testid="increment">+</button>
            <button onClick={decrement} data-testid="decrement">-</button>
            <button onClick={reset} data-testid="reset">Reset</button>
        </div>
    );
}; 