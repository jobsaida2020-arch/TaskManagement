interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>確認</h2>
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
