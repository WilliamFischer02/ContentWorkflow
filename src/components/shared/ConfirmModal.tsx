import { useEffect } from "react";

type ConfirmModalProps = {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({ title, message, onCancel, onConfirm }: ConfirmModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onCancel}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-reset-title"
      aria-describedby="confirm-reset-message"
    >
      <div
        className="w-full max-w-md rounded-3xl border border-white/15 bg-neutral-950/95 p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="confirm-reset-title" className="text-xl font-semibold text-white">
          {title}
        </h3>
        <p id="confirm-reset-message" className="mt-3 text-sm leading-6 text-neutral-300">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-neutral-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl border border-red-400/30 bg-red-500/20 px-4 py-2 text-sm font-medium text-red-100"
          >
            Reset all progress
          </button>
        </div>
      </div>
    </div>
  );
}
