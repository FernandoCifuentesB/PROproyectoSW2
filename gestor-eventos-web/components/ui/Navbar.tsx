import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold">
          QUE-BOLETA 🎫
        </Link>

        <nav className="flex gap-4 text-sm text-[var(--muted)]">
          <Link className="hover:text-white" href="/">
            Eventos
          </Link>
          <Link className="hover:text-white" href="/admin/events">
            Admin Eventos
          </Link>
          <Link className="hover:text-white" href="/admin/categories">
            Admin Categorías
          </Link>
          <Link className="hover:text-white" href="/reports/top">
            Top
          </Link>
        </nav>
      </div>
    </header>
  );
}