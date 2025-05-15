import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Loading from 'libs/saba-games/src/_shared/components/loading';

// Mock the SCSS module
jest.mock('libs/saba-games/src/_shared/components/loading/reconnecting.module.scss', () => ({
  'reconnecting-container': 'mock-reconnecting-container',
  'dot-elastic': 'mock-dot-elastic',
}));

describe('Loading Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<Loading />);
    const wrapper = container.querySelector('.mock-reconnecting-container');
    expect(wrapper).toBeInTheDocument();
  });

  it('has correct container class', () => {
    const { container } = render(<Loading />);
    const wrapper = container.querySelector('.mock-reconnecting-container');
    expect(wrapper).toHaveClass('mock-reconnecting-container');
  });

  it('contains dot-elastic element', () => {
    const { container } = render(<Loading />);
    const dotElastic = container.querySelector('.mock-dot-elastic');
    expect(dotElastic).toBeInTheDocument();
  });
});
