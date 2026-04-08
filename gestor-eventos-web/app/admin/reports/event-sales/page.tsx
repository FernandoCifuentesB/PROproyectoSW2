'use client';

import { useEffect, useMemo, useState } from 'react';

type EventItem = {
  id: string;
  name: string;
  date: string;
};

type ReportRow = {
  eventTicketId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  unitPrice: number;
  stock: number;
  sold: number;
  available: number;
  revenue: number;
};

type ReportResponse = {
  event: {
    id: string;
    name: string;
    date: string;
  };
  summary: {
    totalSold: number;
    totalRevenue: number;
  };
  rows: ReportRow[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function EventSalesReportPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState('');

  const token = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    return (
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      ''
    );
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        setError('');

        const response = await fetch(`${API_URL}/events`, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        });

        if (!response.ok) {
          throw new Error('No fue posible cargar los eventos');
        }

        const data = await response.json();

        const normalizedEvents: EventItem[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];

        setEvents(normalizedEvents);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Ocurrió un error al cargar los eventos',
        );
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [token]);

  const handleGenerateReport = async () => {
    if (!selectedEventId) {
      setError('Debe seleccionar un evento');
      return;
    }

    try {
      setLoadingReport(true);
      setError('');
      setReport(null);

      const response = await fetch(
        `${API_URL}/ticket-purchases/report/event/${selectedEventId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (!response.ok) {
        throw new Error('No fue posible generar el reporte');
      }

      const data: ReportResponse = await response.json();
      setReport(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al generar el reporte',
      );
    } finally {
      setLoadingReport(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            Reporte de entradas por evento
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Seleccione un evento para consultar las boletas vendidas por tipo y
            las ganancias generadas.
          </p>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label
                htmlFor="event"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Evento
              </label>

              <select
                id="event"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-500"
                disabled={loadingEvents}
              >
                <option value="">
                  {loadingEvents
                    ? 'Cargando eventos...'
                    : 'Seleccione un evento'}
                </option>

                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={loadingReport || loadingEvents}
              className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingReport ? 'Generando...' : 'Ver reporte'}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {report && (
          <>
            <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500">Evento</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {report.event.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {formatDate(report.event.date)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Total vendidas</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {report.summary.totalSold}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Boletas vendidas</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {report.summary.totalSold}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Ganancias totales</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {formatCurrency(report.summary.totalRevenue)}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr className="text-left text-sm text-gray-700">
                      <th className="px-4 py-3 font-semibold">
                        Tipo de boleta
                      </th>
                      <th className="px-4 py-3 font-semibold">Precio</th>
                      <th className="px-4 py-3 font-semibold">Stock</th>
                      <th className="px-4 py-3 font-semibold">Vendidas</th>
                      <th className="px-4 py-3 font-semibold">Disponibles</th>
                      <th className="px-4 py-3 font-semibold">Ganancias</th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.rows.map((row) => (
                      <tr
                        key={row.eventTicketId}
                        className="border-t border-gray-200 text-sm text-gray-800"
                      >
                        <td className="px-4 py-3">{row.ticketTypeName}</td>
                        <td className="px-4 py-3">
                          {formatCurrency(row.unitPrice)}
                        </td>
                        <td className="px-4 py-3">{row.stock}</td>
                        <td className="px-4 py-3">{row.sold}</td>
                        <td className="px-4 py-3">{row.available}</td>
                        <td className="px-4 py-3">
                          {formatCurrency(row.revenue)}
                        </td>
                      </tr>
                    ))}

                    <tr className="border-t-2 border-gray-300 bg-gray-50 text-sm font-semibold text-gray-900">
                      <td className="px-4 py-3">Totales</td>
                      <td className="px-4 py-3">-</td>
                      <td className="px-4 py-3">
                        {report.rows.reduce((sum, row) => sum + row.stock, 0)}
                      </td>
                      <td className="px-4 py-3">{report.summary.totalSold}</td>
                      <td className="px-4 py-3">
                        {report.rows.reduce(
                          (sum, row) => sum + row.available,
                          0,
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(report.summary.totalRevenue)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}