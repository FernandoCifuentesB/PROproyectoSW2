"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit() {
    setLoading(true);
    setErr("");
    try {
      const data = await apiPost<{ token: string; user: any }>("/auth/login", { email, password });
      login(data);
      router.push("/");
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <Card className="p-5">
        <h1 className="text-lg font-bold">Iniciar sesión</h1>
        <p className="text-sm text-[var(--muted)]">Invitado solo puede ver eventos.</p>

        <div className="mt-4 space-y-3">
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {err ? <p className="text-sm text-red-500">{err}</p> : null}
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? "Ingresando..." : "Entrar"}
          </Button>
        </div>
      </Card>
    </div>
  );
}