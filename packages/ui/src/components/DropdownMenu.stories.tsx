import type { Meta, StoryObj } from '@storybook/react';
import { DropdownMenu, MenuItem } from './DropdownMenu';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  args: {
    trigger: (
      <button
        style={{
          padding: '0.375rem 0.75rem',
          border: '1px solid var(--color-base-300)',
          borderRadius: 4,
          background: 'none',
          cursor: 'pointer',
          fontSize: '0.8125rem',
        }}
      >
        Actions
      </button>
    ),
    children: (
      <>
        <MenuItem
          label="Send IM"
          onClick={() => {
            alert('Send IM');
          }}
        />
        <MenuItem
          label="View Profile"
          onClick={() => {
            alert('View Profile');
          }}
        />
        <MenuItem
          label="Toggle Close Friend"
          onClick={() => {
            alert('Toggle Close Friend');
          }}
        />
        <MenuItem
          label="Remove Buddy"
          danger
          onClick={() => {
            alert('Remove Buddy');
          }}
        />
      </>
    ),
  },
};

export const LeftAligned: Story = {
  args: {
    align: 'left',
    trigger: (
      <button
        style={{
          padding: '0.375rem 0.75rem',
          border: '1px solid var(--color-base-300)',
          borderRadius: 4,
          background: 'none',
          cursor: 'pointer',
          fontSize: '0.8125rem',
        }}
      >
        Menu
      </button>
    ),
    children: (
      <>
        <MenuItem
          label="Option A"
          onClick={() => {
            alert('A');
          }}
        />
        <MenuItem
          label="Option B"
          onClick={() => {
            alert('B');
          }}
        />
        <MenuItem
          label="Delete"
          danger
          onClick={() => {
            alert('Delete');
          }}
        />
      </>
    ),
  },
};
