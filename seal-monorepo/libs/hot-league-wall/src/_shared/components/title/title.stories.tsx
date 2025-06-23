import type { Meta, StoryObj } from '@storybook/react';
import { Title } from './index';

const meta: Meta<typeof Title> = {
    title: 'components/Title',
    component: Title,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Title>;

export const Default: Story = {
    args: {
        title: 'RNG Soccer',
    },
};

export const LongTitle: Story = {
    args: {
        title: 'This is a very long title that might wrap to multiple lines',
    },
};

export const ShortTitle: Story = {
    args: {
        title: 'Hi',
    },
}; 