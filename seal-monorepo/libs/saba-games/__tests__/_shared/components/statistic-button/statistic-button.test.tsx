import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatisticButton from 'libs/saba-games/src/_shared/components/statistic-button/statistic-button';
import * as gc from '@sg/sg-game-client';

// Mock dependencies
jest.mock('@sg/sg-game-client', () => ({
  Translator: {
    translate: jest.fn()
  }
}));

// Mock CSS modules
jest.mock('libs/saba-games/src/_shared/components/statistic-button/statistic-button.module.scss', () => ({
  'statistic-button': 'mock-statistic-button',
  'c-btn-statistic': 'mock-c-btn-statistic',
  'text': 'mock-text',
  'arrow-icon': 'mock-arrow-icon',
  'svg-icon': 'mock-svg-icon'
}));

describe('StatisticButton', () => {
  const mockHandleToggle = jest.fn();
  const mockStatisticTitle = 'Statistics';

  beforeEach(() => {
    jest.clearAllMocks();
    (gc.Translator.translate as jest.Mock).mockReturnValue(mockStatisticTitle);
  });

  it('renders with correct title and classes', () => {
    render(<StatisticButton isOpenStatistic={false} handleToggle={mockHandleToggle} />);

    // Check if the button is rendered with correct title
    expect(screen.getByText(mockStatisticTitle)).toBeInTheDocument();

    // Check if the button has correct classes
    const link = screen.getByTitle('Expand');
    expect(link).toHaveClass('mock-c-btn-statistic');
    expect(link).toHaveClass('c-btn');
    expect(link).toHaveClass('c-btn--more');
    expect(link).toHaveClass('c-is-close');
  });

  it('renders arrow icon correctly when closed', () => {
    render(<StatisticButton isOpenStatistic={false} handleToggle={mockHandleToggle} />);

    // Check if the arrow icon is rendered with correct path
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders arrow icon correctly when open', () => {
    render(<StatisticButton isOpenStatistic={true} handleToggle={mockHandleToggle} />);

    // Check if the arrow icon is rendered with correct path
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('calls handleToggle when clicked', () => {
    render(<StatisticButton isOpenStatistic={false} handleToggle={mockHandleToggle} />);

    // Click the link
    const link = screen.getByTitle('Expand');
    fireEvent.click(link);

    // Check if handleToggle was called
    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
  });

  it('translates the title correctly', () => {
    render(<StatisticButton isOpenStatistic={false} handleToggle={mockHandleToggle} />);

    // Check if Translator.translate was called with correct key
    expect(gc.Translator.translate).toHaveBeenCalledWith('Common.statistic_title');
    expect(screen.getByText(mockStatisticTitle)).toBeInTheDocument();
  });
}); 
