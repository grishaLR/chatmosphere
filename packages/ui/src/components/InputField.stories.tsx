import type { Meta, StoryObj } from '@storybook/react';
import { InputField } from './InputField';

const meta: Meta<typeof InputField> = {
  title: 'Components/InputField',
  component: InputField,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 300 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof InputField>;

export const Default: Story = {
  args: {
    placeholder: 'Search rooms...',
    variant: 'default',
  },
};

export const Compact: Story = {
  args: {
    placeholder: 'Add buddy by handle...',
    variant: 'compact',
  },
};

export const WithValue: Story = {
  args: {
    value: 'alice.bsky.social',
    variant: 'default',
    readOnly: true,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    variant: 'default',
    disabled: true,
  },
};
