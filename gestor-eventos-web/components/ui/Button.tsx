"use client";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "danger";
};

export default function Button({ variant = "primary", className = "", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60";
  const styles: Record<string, string> = {
    primary: "bg-[var(--primary)] text-white hover:brightness-105",
    outline: "border border-[var(--border)] bg-white hover:bg-slate-50",
    danger: "bg-[var(--danger)] text-white hover:brightness-105",
  };

  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}