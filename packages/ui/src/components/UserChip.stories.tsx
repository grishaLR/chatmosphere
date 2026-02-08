import type { Meta, StoryObj } from '@storybook/react';
import { UserChip } from './UserChip';

const meta: Meta<typeof UserChip> = {
  title: 'Components/UserChip',
  component: UserChip,
};

export default meta;
type Story = StoryObj<typeof UserChip>;

export const WithHandle: Story = {
  args: {
    did: 'did:plc:abc123',
    handle: 'alice.bsky.social',
    size: 'sm',
  },
};

export const WithAvatar: Story = {
  args: {
    did: 'did:plc:abc123',
    handle: 'alice.bsky.social',
    avatarUrl: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=alice',
    size: 'md',
  },
};

export const DidOnly: Story = {
  args: {
    did: 'did:plc:xyzlongidentifierstring',
  },
};

export const WithAlertBadge: Story = {
  args: {
    did: 'did:plc:abc123',
    handle: 'suspicious.user',
    avatarUrl: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=sus',
    alertBadge: '\u26a0',
    size: 'md',
  },
};

export const WithInfoBadge: Story = {
  args: {
    did: 'did:plc:abc123',
    handle: 'new.user',
    infoBadge: '\u24d8',
    size: 'md',
  },
};

export const Blurred: Story = {
  args: {
    did: 'did:plc:abc123',
    handle: 'blocked.user',
    avatarUrl: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=block',
    blurred: true,
    size: 'md',
  },
};
