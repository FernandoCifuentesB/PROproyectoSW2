"use client";

export default function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-[var(--border)] bg-white/5 px-4 py-2 text-sm outline-none focus:border-white/30 ${
        props.className ?? ""
      }`}
    />
  );
}