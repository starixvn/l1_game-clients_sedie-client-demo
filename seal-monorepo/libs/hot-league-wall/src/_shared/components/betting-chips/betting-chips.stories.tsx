import type { Meta, StoryObj } from '@storybook/react';
import BettingChips from './betting-chips';

const meta: Meta<typeof BettingChips> = {
  title: 'components/BettingChips',
  component: BettingChips,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    min: { control: { type: 'number' }, defaultValue: 10 },
    max: { control: { type: 'number' }, defaultValue: 1000 },
    currentAmount: { control: { type: 'number' }, defaultValue: 10 },
  },
};

export default meta;
type Story = StoryObj<typeof BettingChips>;

const mockT = (key: string) => {
  if (key === 'Common.min_bet') return 'Min Bet';
  if (key === 'Common.max_bet') return 'Max Bet';
  return key;
};
const mockAddCommas = (num: number) => num.toLocaleString();

export const Default: Story = {
  args: {
    min: 10,
    max: 1000,
    currentAmount: 10,
    t: mockT,
    addCommas: mockAddCommas,
    onAmountChange: (amount: number) => {
      // This will be replaced by Storybook controls
      alert('Amount changed to: ' + amount);
    },
  },
}; 