import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { Button } from './Button';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'キャンセル',
}: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className={clsx(
          'relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl',
          'transform transition-all'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Title */}
        <h2 id="dialog-title" className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h2>

        {/* Content */}
        <div className="mb-6 text-gray-700">{children}</div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          {onConfirm && (
            <Button variant="primary" onClick={onConfirm}>
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
