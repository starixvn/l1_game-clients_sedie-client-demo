import type { Meta, StoryObj } from '@storybook/react';
import { FlipCard } from './flip-card';
import { CardResult } from '../type';

const meta: Meta<typeof FlipCard> = {
    title: 'Components/Card/FlipCard',
    component: FlipCard,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FlipCard>;

const defaultCard = {
    rank: 0,
    suit: 0
};

export const Default: Story = {
    args: {
        card: defaultCard,
        isShowResult: false,
        playResultAnimation: true,
    },
};

export const Flipped: Story = {
    args: {
        card: defaultCard,
        isShowResult: true,
        playResultAnimation: true,
    },
};

export const NoAnimation: Story = {
    args: {
        card: defaultCard,
        isShowResult: true,
        playResultAnimation: false,
    },
};

export const WithCustomDuration: Story = {
    args: {
        card: defaultCard,
        isShowResult: true,
        playResultAnimation: true,
    },
};