"use client";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { CheckCircle2, Trash2, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">KONSOL BROADCAST</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent = "blue",
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <div className={`stat-card panel ${accent}`}>
      <div>
        <span>{label}</span>
        <Icon size={21} />
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </div>
  );
}
export function Notice({ message }: { message: string }) {
  return message ? (
    <div className="notice" role="status">
      <CheckCircle2 size={17} />
      {message}
    </div>
  ) : null;
}
export const savedMessage = (persisted: boolean) =>
  persisted
    ? "Perubahan tersimpan di browser ini."
    : "Perubahan tersimpan untuk sesi ini. Penyimpanan browser tidak tersedia.";
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog ref={ref} className="modal" aria-label={title} onCancel={onClose}>
      <div className="modal-heading">
        <h2>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Tutup dialog"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {Children.map(children, (child) =>
        isValidElement(child) &&
        ["input", "select", "textarea"].includes(String(child.type))
          ? cloneElement(
              child as ReactElement<{
                id?: string;
                "aria-describedby"?: string;
              }>,
              { id, "aria-describedby": hint ? `${id}-hint` : undefined },
            )
          : child,
      )}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}
export function FormActions({
  onCancel,
  label = "Simpan perubahan",
}: {
  onCancel?: () => void;
  label?: string;
}) {
  return (
    <div className="form-actions">
      {onCancel && (
        <button type="button" className="button secondary" onClick={onCancel}>
          Batal
        </button>
      )}
      <button type="submit" className="button primary">
        {label}
      </button>
    </div>
  );
}
export function DeleteButton({
  title,
  onDelete,
}: {
  title: string;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="icon-button danger"
        aria-label={`Hapus ${title}`}
        onClick={() => setOpen(true)}
      >
        <Trash2 size={16} />
      </button>
      {open && (
        <Modal title="Hapus konten?" onClose={() => setOpen(false)}>
          <p className="text-secondary">
            “{title}” akan dihapus dari tampilan publik.
          </p>
          <div className="form-actions">
            <button className="button secondary" onClick={() => setOpen(false)}>
              Batal
            </button>
            <button
              className="button danger"
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
            >
              Hapus
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
