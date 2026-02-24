"use client";

export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-[var(--border)] bg-white/5 px-4 py-2 text-sm outline-none placeholder:text-[var(--muted)] focus:border-white/30 ${
        props.className ?? ""
      }`}
    />
  );
}