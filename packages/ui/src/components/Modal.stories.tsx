import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: function ModalStory() {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <button
          onClick={() => {
            setOpen(true);
          }}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Open Modal
        </button>
        <Modal
          open={open}
          onClose={() => {
            setOpen(false);
          }}
        >
          <div style={{ padding: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.25rem' }}>Create Room</h2>
            <p style={{ margin: '0 0 1rem', fontSize: '0.875rem' }}>
              This is a modal dialog for creating a new chat room.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.5rem',
              }}
            >
              <button
                onClick={() => {
                  setOpen(false);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid var(--color-base-300)',
                  borderRadius: 4,
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Create
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  },
};
