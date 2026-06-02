"use client";

import { FormEvent, useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type AuthModalProps = {
  open: boolean;
  defaultTab?: "login" | "register";
  onClose: () => void;
};

type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "USER";
  };
};

export default function AuthModal({
  open,
  defaultTab = "login",
  onClose,
}: AuthModalProps) {
  const { login } = useAuth();

  const [tab, setTab] = useState<"login" | "register">(defaultTab);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTab(defaultTab);
    setLoginError("");
    setRegisterError("");
  }, [open, defaultTab]);

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await apiPost<LoginResponse>("/auth/login", {
        email: loginEmail.trim(),
        password: loginPassword,
      });

      login(response);
      onClose();
    } catch (error: unknown) {
      setLoginError(error instanceof Error ? error.message : "No fue posible iniciar sesión.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegisterError("");
    setRegisterLoading(true);

    try {
      const response = await apiPost<LoginResponse>("/auth/register", {
        name: registerName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
      });

      login(response);
      onClose();
    } catch (error: unknown) {
      setRegisterError(error instanceof Error ? error.message : "No fue posible crear la cuenta.");
    } finally {
      setRegisterLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="relative mx-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-950">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold text-blue-950">
            {tab === "login" ? "Bienvenido" : "Crea tu cuenta"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {tab === "login"
              ? "Ingresa para continuar en Que Boleta"
              : "Regístrate para comprar y guardar tus eventos favoritos"}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-2xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
              tab === "login"
                ? "bg-white text-blue-950 shadow-sm"
                : "text-gray-500 hover:text-blue-900"
            }`}
          >
            Iniciar sesión
          </button>

          <button
            type="button"
            onClick={() => setTab("register")}
            className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
              tab === "register"
                ? "bg-white text-blue-950 shadow-sm"
                : "text-gray-500 hover:text-blue-900"
            }`}
          >
            Registrarse
          </button>
        </div>

        {tab === "login" ? (
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Correo electrónico
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                placeholder="tucorreo@ejemplo.com"
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="accent-blue-900" />
                <span>Recordarme</span>
              </label>

              <button
                type="button"
                className="text-sm font-medium text-blue-900 transition hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {loginError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-2xl bg-blue-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loginLoading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                value={registerName}
                onChange={(event) => setRegisterName(event.target.value)}
                placeholder="Tu nombre completo"
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Correo electrónico
              </label>
              <input
                type="email"
                value={registerEmail}
                onChange={(event) => setRegisterEmail(event.target.value)}
                placeholder="tucorreo@ejemplo.com"
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                value={registerPassword}
                onChange={(event) => setRegisterPassword(event.target.value)}
                placeholder="Crea una contraseña"
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            {registerError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {registerError}
              </div>
            )}

            <button
              type="submit"
              disabled={registerLoading}
              className="w-full rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-bold text-blue-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {registerLoading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}