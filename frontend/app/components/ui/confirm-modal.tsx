import React, { useEffect, useRef, useState } from 'react';
import { translate } from '../../utils/translations';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonClass?: string;
  confirmInput?: {
    placeholder: string;
    expectedValue: string;
  };
}

/**
 * Generic confirmation modal component.
 *
 * Provides a reusable modal for dangerous actions with optional input validation.
 * Handles focus management and keyboard navigation for accessibility.
 */
export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  confirmButtonClass = 'bg-red-600 hover:bg-red-700',
  confirmInput,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const [inputValue, setInputValue] = useState('');

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      if (confirmInput && inputRef.current) {
        inputRef.current.focus();
      } else if (confirmButtonRef.current) {
        confirmButtonRef.current.focus();
      }
    }
  }, [isOpen, confirmInput]);

  if (!isOpen) return null;

  const isConfirmDisabled =
    confirmInput && inputValue !== confirmInput.expectedValue;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={e => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        ref={modalRef}
        className="bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title" className="text-xl font-bold text-white mb-4">
          {title}
        </h2>

        <p className="text-gray-300 mb-6">{message}</p>

        {confirmInput && (
          <div className="mb-6">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={confirmInput.placeholder}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            {cancelLabel ?? translate('common.cancel')}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
              isConfirmDisabled
                ? 'bg-gray-600 cursor-not-allowed'
                : confirmButtonClass
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
