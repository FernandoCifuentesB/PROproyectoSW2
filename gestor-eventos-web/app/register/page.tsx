"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Role = "ADMIN" | "USER";
type User = { id: string; name: string; email: string; role: Role };

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    setLoading(true);
    try {
      const data = await apiPost<{ token: string; user: User }>("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      login({ token: data.token, user: data.user });
      router.push("/");
    } catch (e: any) {
      setError(e?.message ?? "Error registrando usuario");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="space-y-3">
        <h1 className="text-xl font-extrabold">Crear cuenta</h1>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <Input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button onClick={submit} disabled={loading || !name.trim() || !email.trim() || password.length < 6}>
          {loading ? "Creando..." : "Registrarme"}
        </Button>

        <p className="text-sm text-[var(--muted)]">
          ¿Ya tienes cuenta?{" "}
          <a className="underline" href="/login">
            Inicia sesión
          </a>
        </p>
      </Card>
    </div>
  );
}