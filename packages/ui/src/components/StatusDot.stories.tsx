import type { Meta, StoryObj } from '@storybook/react';
import { StatusDot } from './StatusDot';

const meta: Meta<typeof StatusDot> = {
  title: 'Components/StatusDot',
  component: StatusDot,
  argTypes: {
    status: {
      control: 'select',
      options: ['online', 'away', 'idle', 'offline', 'invisible'],
    },
    size: {
      control: 'radio',
      options: ['sm', 'md'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusDot>;

export const Online: Story = {
  args: { status: 'online', size: 'md' },
};

export const Away: Story = {
  args: { status: 'away', size: 'md' },
};

export const Idle: Story = {
  args: { status: 'idle', size: 'md' },
};

export const Offline: Story = {
  args: { status: 'offline', size: 'md' },
};

export const Small: Story = {
  args: { status: 'online', size: 'sm' },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      {(['online', 'away', 'idle', 'offline', 'invisible'] as const).map((status) => (
        <div
          key={status}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}
        >
          <StatusDot status={status} size="md" />
          <span style={{ fontSize: '0.75rem' }}>{status}</span>
        </div>
      ))}
    </div>
  ),
};
