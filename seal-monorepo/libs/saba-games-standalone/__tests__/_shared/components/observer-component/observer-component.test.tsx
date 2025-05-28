import React from 'react';
import { render, act } from '@testing-library/react';
import { useObserver } from '@sg/sg-observer';
import { IPropsObserver, IStateObserver } from 'libs/saba-games/src/_shared/components/observer-component/observer-component';
import { ObserverComponent } from 'libs/saba-games/src/_shared/components/observer-component/observer-component';

jest.mock('@sg/sg-observer', () => ({
    useObserver: jest.fn(),
}));

type TestProps = IPropsObserver & { children?: React.ReactNode };
type TestState = IStateObserver;

class TestObserver extends ObserverComponent<TestProps, TestState> {
    render() {
        return <div>Test Observer</div>;
    }
}

describe('ObserverComponent', () => {
    const mockDispose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should register observer on mount when namespace is present', () => {
        (useObserver as jest.Mock).mockReturnValue(mockDispose);

        render(<TestObserver namespace="testNamespace" />);

        expect(useObserver).toHaveBeenCalledWith(expect.any(TestObserver), 'testNamespace');
    });

    it('should handle observer registration failure and retry', () => {
        const retryDispose = jest.fn();

        // First call fails
        (useObserver as jest.Mock).mockImplementationOnce(() => {
            throw new Error('Initial failure');
        });

        // Retry returns a dispose function
        (useObserver as jest.Mock).mockImplementationOnce(() => retryDispose);

        render(<TestObserver namespace="retryNamespace" />);

        // Fast-forward timers to trigger retry
        act(() => {
            jest.advanceTimersByTime(100);
        });

        expect(useObserver).toHaveBeenCalledTimes(2);
        expect(useObserver).toHaveBeenLastCalledWith(expect.any(TestObserver), 'retryNamespace');
    });

    it('should not register observer when namespace is missing', () => {
        render(<TestObserver namespace="" />);
        expect(useObserver).not.toHaveBeenCalled();
    });

    it('should call dispose on unmount', () => {
        (useObserver as jest.Mock).mockReturnValue(mockDispose);

        const { unmount } = render(<TestObserver namespace="testNamespace" />);
        unmount();

        expect(mockDispose).toHaveBeenCalled();
    });

    it('should handle dispose throwing an error on unmount gracefully', () => {
        const errorDispose = jest.fn(() => {
            throw new Error('Dispose failure');
        });

        (useObserver as jest.Mock).mockReturnValue(errorDispose);

        const { unmount } = render(<TestObserver namespace="testNamespace" />);
        expect(() => unmount()).not.toThrow();
    });
});
