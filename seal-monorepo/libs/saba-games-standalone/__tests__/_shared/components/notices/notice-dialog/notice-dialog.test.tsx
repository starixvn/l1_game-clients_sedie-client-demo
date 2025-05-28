import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NoticeDialog from 'libs/saba-games/src/_shared/components/notices/notice-dialog';
import * as gc from '@sg/sg-game-client';

// Mock the SCSS module
jest.mock('libs/saba-games/src/_shared/components/notices/notice-dialog/notice-dialog.module.scss', () => ({
    'wrapper-dialog': 'mock-wrapper-dialog',
    'notice-container': 'mock-notice-container',
    'notice-info': 'mock-notice-info',
    'error': 'mock-error',
    'warning': 'mock-warning',
    'bg-info': 'mock-bg-info',
    'bg-error': 'mock-bg-error',
    'disabled-game': 'mock-disabled-game'
}));

// Mock @sg/sg-game-client
jest.mock('@sg/sg-game-client', () => ({
    Notices: {
        NoticeType: {
            Error: 'error',
            Info: 'info'
        },
        NoticeInfo: {
            DisabledGame: 'disabled-game'
        }
    }
}));

describe('NoticeDialog', () => {
    const mockOnClose = jest.fn();
    const mockChildren = <div>Test Content</div>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(
            <NoticeDialog onClose={mockOnClose}>
                {mockChildren}
            </NoticeDialog>
        );
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies correct classes for error type', () => {
        const { container } = render(
            <NoticeDialog type={gc.Notices.NoticeType.Error} onClose={mockOnClose}>
                {mockChildren}
            </NoticeDialog>
        );
        const noticeContainer = container.querySelector('.mock-notice-container');
        expect(noticeContainer).toHaveClass('mock-error');
        expect(noticeContainer).toHaveClass('mock-bg-error');
    });

    it('applies correct classes for info type', () => {
        const { container } = render(
            <NoticeDialog type={gc.Notices.NoticeType.Info} onClose={mockOnClose}>
                {mockChildren}
            </NoticeDialog>
        );
        const noticeContainer = container.querySelector('.mock-notice-container');
        expect(noticeContainer).toHaveClass('mock-bg-info');
    });

    it('applies disabled game class when noticeInfo is DisabledGame', () => {
        const { container } = render(
            <NoticeDialog
                noticeInfo={gc.Notices.NoticeInfo.DisabledGame}
                onClose={mockOnClose}
            >
                {mockChildren}
            </NoticeDialog>
        );
        const noticeContainer = container.querySelector('.mock-notice-container');
        expect(noticeContainer).toHaveClass('mock-disabled-game');
    });

    it('calls onClose when clicking outside and not disabled', () => {
        render(
            <NoticeDialog onClose={mockOnClose}>
                {mockChildren}
            </NoticeDialog>
        );
        fireEvent.mouseDown(document);
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('does not call onClose when clicking outside and disabled', () => {
        render(
            <NoticeDialog
                noticeInfo={gc.Notices.NoticeInfo.DisabledGame}
                onClose={mockOnClose}
            >
                {mockChildren}
            </NoticeDialog>
        );
        fireEvent.mouseDown(document);
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('renders children in notice-info container', () => {
        const { container } = render(
            <NoticeDialog onClose={mockOnClose}>
                {mockChildren}
            </NoticeDialog>
        );
        const noticeInfo = container.querySelector('.mock-notice-info');
        expect(noticeInfo).toContainElement(screen.getByText('Test Content'));
    });
}); 
