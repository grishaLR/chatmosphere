import type { Meta, StoryObj } from '@storybook/react';
import { BuddyGroup } from './BuddyGroup';
import { StatusDot } from './StatusDot';

const meta: Meta<typeof BuddyGroup> = {
  title: 'Components/BuddyGroup',
  component: BuddyGroup,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 240, border: '1px solid var(--color-base-300)' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BuddyGroup>;

const BuddyRow = ({
  name,
  status,
}: {
  name: string;
  status: 'online' | 'away' | 'idle' | 'offline';
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.375rem 0.75rem',
      fontSize: '0.75rem',
    }}
  >
    <StatusDot status={status} size="sm" />
    <span>{name}</span>
  </div>
);

export const OnlineGroup: Story = {
  args: {
    label: 'Online',
    count: 3,
    defaultOpen: true,
    children: (
      <>
        <BuddyRow name="alice.bsky.social" status="online" />
        <BuddyRow name="bob.bsky.social" status="online" />
        <BuddyRow name="carol.bsky.social" status="online" />
      </>
    ),
  },
};

export const AwayGroup: Story = {
  args: {
    label: 'Away',
    count: 2,
    defaultOpen: true,
    children: (
      <>
        <BuddyRow name="dave.bsky.social" status="away" />
        <BuddyRow name="eve.bsky.social" status="away" />
      </>
    ),
  },
};

export const CollapsedGroup: Story = {
  args: {
    label: 'Offline',
    count: 5,
    defaultOpen: false,
    children: (
      <>
        <BuddyRow name="frank.bsky.social" status="offline" />
        <BuddyRow name="grace.bsky.social" status="offline" />
        <BuddyRow name="heidi.bsky.social" status="offline" />
        <BuddyRow name="ivan.bsky.social" status="offline" />
        <BuddyRow name="judy.bsky.social" status="offline" />
      </>
    ),
  },
};

export const FullBuddyList: Story = {
  render: () => (
    <div>
      <BuddyGroup label="Online" count={2} defaultOpen>
        <BuddyRow name="alice.bsky.social" status="online" />
        <BuddyRow name="bob.bsky.social" status="online" />
      </BuddyGroup>
      <BuddyGroup label="Away" count={1} defaultOpen>
        <BuddyRow name="carol.bsky.social" status="away" />
      </BuddyGroup>
      <BuddyGroup label="Offline" count={3} defaultOpen={false}>
        <BuddyRow name="dave.bsky.social" status="offline" />
        <BuddyRow name="eve.bsky.social" status="offline" />
        <BuddyRow name="frank.bsky.social" status="offline" />
      </BuddyGroup>
    </div>
  ),
};
