"use client"

import React from "react";
import { Loader2, TriangleAlert } from "lucide-react";

type AlertDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
  showCancel?: boolean;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
};

export default function AlertDialog({
  open,
  title,
  description,
  confirmLabel = "Tiếp tục",
  cancelLabel = "Hủy",
  variant = "default",
  loading = false,
  showCancel = true,
  onConfirm,
  onOpenChange,
}: AlertDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-full ${
                variant === "destructive" ? "bg-red-50 text-red-600" : "bg-zinc-100 text-zinc-700"
              }`}
            >
              <TriangleAlert size={18} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-950">{title}</h2>
              <p className="text-sm leading-6 text-zinc-500">{description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-6 py-4">
          {showCancel && (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              variant === "destructive" ? "bg-red-600 hover:bg-red-700" : "bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
