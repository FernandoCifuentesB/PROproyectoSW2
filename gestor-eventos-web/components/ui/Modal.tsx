"use client";

import { ReactNode, useEffect } from "react";

type Props = {
  open: boolean;
  children: ReactNode;
  onClose: () => void;
  title?: string;
};

export default function Modal({ open, children, onClose, title }: Props) {
  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "Modal"}
    >
      <div
        className="relative z-[10000] max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {title ? (
          <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-black text-blue-950">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Actualice la información y guarde los cambios.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Cerrar modal"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Cerrar modal"
          >
            ×
          </button>
        )}

        {children}
      </div>
    </div>
  );
}