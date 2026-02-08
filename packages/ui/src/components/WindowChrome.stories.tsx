import type { Meta, StoryObj } from '@storybook/react';
import { WindowChrome } from './WindowChrome';

const meta: Meta<typeof WindowChrome> = {
  title: 'Components/WindowChrome',
  component: WindowChrome,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WindowChrome>;

export const Default: Story = {
  args: {
    title: 'alice.bsky.social',
    children: <div style={{ padding: '1rem', fontSize: '0.8125rem' }}>Chat content goes here</div>,
  },
};

export const WithActions: Story = {
  args: {
    title: 'bob.bsky.social',
    actions: (
      <>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            opacity: 0.8,
            fontSize: '0.75rem',
          }}
        >
          _
        </button>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            opacity: 0.8,
            fontSize: '0.75rem',
          }}
        >
          x
        </button>
      </>
    ),
    children: (
      <div style={{ padding: '0.5rem', fontSize: '0.8125rem', height: 200 }}>
        DM conversation area
      </div>
    ),
  },
};

export const Clickable: Story = {
  args: {
    title: 'carol.bsky.social (3)',
    onTitleClick: () => {
      alert('Title clicked — toggle minimize');
    },
    children: (
      <div style={{ padding: '1rem', fontSize: '0.8125rem' }}>Click the title bar to minimize</div>
    ),
  },
};
