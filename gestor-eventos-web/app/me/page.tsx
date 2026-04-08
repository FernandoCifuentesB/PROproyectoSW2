"use client";

import Link from "next/link";

export default function MePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mi cuenta</h1>
        <p className="mt-2 text-gray-600">
          Desde aquí puede consultar sus compras y acceder a sus boletas.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/me/purchases"
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="text-xl font-semibold text-gray-900">Mis compras</h2>
          <p className="mt-2 text-sm text-gray-600">
            Permite ver el historial de compras, consultar las boletas e
            imprimirlas de forma individual o general.
          </p>
        </Link>

        <Link
          href="/"
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="text-xl font-semibold text-gray-900">Seguir explorando</h2>
          <p className="mt-2 text-sm text-gray-600">
            Permite volver al listado principal de eventos disponibles.
          </p>
        </Link>
      </section>
    </main>
  );
}