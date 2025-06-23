import AuthorizationHandler from 'libs/saba-games/src/_shared/handlers/authorization-handler';

jest.useFakeTimers();

describe('AuthorizationHandler', () => {
    let handleSignInMock: jest.Mock;
    let autoCreateNicknameMock: jest.Mock;
    let handler: AuthorizationHandler;
    let setTimeoutSpy: jest.SpyInstance;
    let clearTimeoutSpy: jest.SpyInstance;

    beforeEach(() => {
        handleSignInMock = jest.fn();
        autoCreateNicknameMock = jest.fn();
        setTimeoutSpy = jest.spyOn(global, 'setTimeout');
        clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    afterEach(() => {
        setTimeoutSpy.mockRestore();
        clearTimeoutSpy.mockRestore();
    });

    describe('Constructor', () => {
        it('should initialize with provided values', () => {
            handler = new AuthorizationHandler(
                true,
                false,
                handleSignInMock,
                autoCreateNicknameMock
            );

            expect(handler).toBeDefined();
        });
    });

    describe('waitForAuthorization', () => {
        it('should call handleUserSignIn when already authorized', () => {
            handler = new AuthorizationHandler(
                true,
                false,
                handleSignInMock,
                autoCreateNicknameMock
            );

            handler.waitForAuthorization();
            jest.runAllTimers();
            expect(handleSignInMock).toHaveBeenCalled();
        });

        it('should set timeout when not authorized', () => {
            handler = new AuthorizationHandler(
                false,
                false,
                handleSignInMock,
                autoCreateNicknameMock
            );

            handler.waitForAuthorization();
            expect(handleSignInMock).not.toHaveBeenCalled();
            expect(setTimeoutSpy).toHaveBeenCalled();
        });

        it('should retry authorization check until max timeout', () => {
            handler = new AuthorizationHandler(
                false,
                false,
                handleSignInMock,
                autoCreateNicknameMock
            );

            handler.waitForAuthorization();

            // Advance timers to just before max timeout
            jest.advanceTimersByTime(9900);
            expect(handleSignInMock).not.toHaveBeenCalled();
            expect(setTimeoutSpy).toHaveBeenCalledTimes(100);

            // Advance past max timeout
            jest.advanceTimersByTime(200);
            expect(setTimeoutSpy).not.toHaveBeenCalledTimes(101);
        });
    });

    describe('clearTimeout', () => {
        it('should clear existing timeout', () => {
            handler = new AuthorizationHandler(
                false,
                false,
                handleSignInMock,
                autoCreateNicknameMock
            );

            handler.waitForAuthorization();
            expect(setTimeoutSpy).toHaveBeenCalled();

            handler.clearTimeout();
            expect(clearTimeoutSpy).toHaveBeenCalled();
        });

        it('should handle case when no timeout exists', () => {
            handler = new AuthorizationHandler(
                false,
                false,
                handleSignInMock,
                autoCreateNicknameMock
            );

            handler.clearTimeout();
            expect(clearTimeoutSpy).not.toHaveBeenCalled();
        });
    });

    describe('handleUserSignIn', () => {
        it('should call handleSignIn when user is not signed in', () => {
            handler = new AuthorizationHandler(
                true,
                false,
                handleSignInMock,
                autoCreateNicknameMock
            );

            handler.waitForAuthorization();
            jest.runAllTimers();
            expect(handleSignInMock).toHaveBeenCalled();
        });

        it('should not call handleSignIn when user is already signed in', () => {
            handler = new AuthorizationHandler(
                true,
                true,
                handleSignInMock,
                autoCreateNicknameMock
            );

            handler.waitForAuthorization();
            jest.runAllTimers();
            expect(handleSignInMock).not.toHaveBeenCalled();
        });
    });

    describe('handleWaitForAuthorize', () => {
        it('should call autoCreateNickname when not authorized', () => {
            handler = new AuthorizationHandler(
                false,
                false,
                handleSignInMock,
                autoCreateNicknameMock
            );

            handler.handleWaitForAuthorize();
            expect(autoCreateNicknameMock).toHaveBeenCalled();
            expect(setTimeoutSpy).toHaveBeenCalled();
        });

        it('should not call autoCreateNickname when already authorized', () => {
            handler = new AuthorizationHandler(
                true,
                false,
                handleSignInMock,
                autoCreateNicknameMock
            );

            handler.handleWaitForAuthorize();
            jest.runAllTimers();
            expect(autoCreateNicknameMock).not.toHaveBeenCalled();
            expect(handleSignInMock).toHaveBeenCalled();
        });

        it('should start authorization check regardless of initial state', () => {
            handler = new AuthorizationHandler(
                true,
                false,
                handleSignInMock,
                autoCreateNicknameMock
            );

            handler.handleWaitForAuthorize();
            jest.runAllTimers();
            expect(handleSignInMock).toHaveBeenCalled();
        });
    });
}); 
