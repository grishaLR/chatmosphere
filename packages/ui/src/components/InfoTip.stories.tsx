import type { Meta, StoryObj } from '@storybook/react';
import { InfoTip } from './InfoTip';

const meta: Meta<typeof InfoTip> = {
  title: 'Components/InfoTip',
  component: InfoTip,
  decorators: [
    (Story) => (
      <div style={{ padding: '6rem 2rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof InfoTip>;

export const Default: Story = {
  args: {
    text: 'This is a helpful tooltip that explains something important to the user.',
  },
};

export const LongText: Story = {
  args: {
    text: 'A direct connection is pure peer-to-peer. Your call goes straight to the other person with no server in between, which means low latency and a clear, snappy picture. The trade-off is that your IP address is visible to them. Think of your IP address like the front door of your house on the internet.',
  },
};

export const InlineWithLabel: Story = {
  render: () => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '14px' }}>
      <input type="radio" defaultChecked />
      Direct for inner circle
      <InfoTip text="Direct connections are pure peer-to-peer with low latency and a clear, snappy picture." />
    </label>
  ),
};
