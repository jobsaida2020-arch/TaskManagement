import { useEscapeKey } from "../hooks/useEscapeKey";

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  useEscapeKey(onCancel);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="confirm-dialog-title">確認</h2>
          <button type="button" className="modal-close" onClick={onCancel} aria-label="閉じる">
            ×
          </button>
        </div>
        <p>{message}</p>
        <div className="modal-actions">
          <button type="button" onClick={onCancel}>
            キャンセル
          </button>
          <button type="button" className="danger-button" onClick={onConfirm}>
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
