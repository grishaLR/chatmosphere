import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'discussion',
  },
};

export const ErrorBadge: Story = {
  args: {
    variant: 'error',
    children: '3',
  },
};

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    children: 'unlisted',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <Badge>discussion</Badge>
      <Badge variant="neutral">private</Badge>
      <Badge variant="error">5</Badge>
    </div>
  ),
};
