import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmModal } from '../../app/components/ui/confirm-modal';
import { AvatarPicker } from '../../app/components/ui/avatar-picker';

describe('ConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Test Title',
    message: 'Test Message',
    confirmLabel: 'Confirm',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('should render modal when open', () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Abbrechen')).toBeInTheDocument();
  });

  it('should not render modal when closed', () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);

    await userEvent.click(screen.getByText('Confirm'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn();
    render(<ConfirmModal {...defaultProps} onCancel={onCancel} />);

    await userEvent.click(screen.getByText('Abbrechen'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when clicking outside modal', async () => {
    const onCancel = vi.fn();
    const { container } = render(<ConfirmModal {...defaultProps} onCancel={onCancel} />);

    const backdrop = container.querySelector('.fixed.inset-0');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when escape key is pressed', async () => {
    const onCancel = vi.fn();
    render(<ConfirmModal {...defaultProps} onCancel={onCancel} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle confirmInput correctly', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmModal
        {...defaultProps}
        onConfirm={onConfirm}
        confirmInput={{
          placeholder: 'Type "DELETE" to confirm',
          expectedValue: 'DELETE',
        }}
      />
    );

    const confirmButton = screen.getByText('Confirm');
    const input = screen.getByPlaceholderText('Type "DELETE" to confirm');

    // Button should be disabled initially
    expect(confirmButton).toBeDisabled();

    // Type wrong value
    await userEvent.type(input, 'WRONG');
    expect(confirmButton).toBeDisabled();

    // Clear and type correct value
    await userEvent.clear(input);
    await userEvent.type(input, 'DELETE');
    expect(confirmButton).not.toBeDisabled();

    // Click confirm
    await userEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

describe('AvatarPicker', () => {
  const defaultProps = {
    value: '/avatars/player_male_with_greataxe.png',
    onChange: vi.fn(),
  };

  it('should render all available avatars', () => {
    render(<AvatarPicker {...defaultProps} />);

    const avatarButtons = screen.getAllByRole('button');
    expect(avatarButtons).toHaveLength(4);

    // Check that all avatar images are rendered
    const avatarImages = screen.getAllByRole('img');
    expect(avatarImages).toHaveLength(4);
  });

  it('should highlight the selected avatar', () => {
    render(<AvatarPicker {...defaultProps} />);

    const avatarButtons = screen.getAllByRole('button');
    const selectedButton = avatarButtons[0]; // First avatar is selected based on defaultProps

    expect(selectedButton.className).toContain('border-[#FCC822]');
    expect(selectedButton.className).toContain('bg-[#FCC822]');
  });

  it('should call onChange when avatar is clicked', async () => {
    const onChange = vi.fn();
    render(<AvatarPicker {...defaultProps} onChange={onChange} />);

    const avatarButtons = screen.getAllByRole('button');
    await userEvent.click(avatarButtons[1]); // Click second avatar

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('/avatars/player_female_with_sword.png');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <AvatarPicker {...defaultProps} className="custom-class" />
    );

    const grid = container.querySelector('.grid');
    expect(grid?.className).toContain('custom-class');
  });

  it('should have proper accessibility attributes', () => {
    render(<AvatarPicker {...defaultProps} />);

    const avatarButtons = screen.getAllByRole('button');
    avatarButtons.forEach((button, index) => {
      expect(button).toHaveAttribute('aria-label', `Select avatar ${index + 1}`);
    });
  });
});
