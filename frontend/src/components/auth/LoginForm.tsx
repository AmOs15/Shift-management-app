"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MOCK_USER } from "@/lib/mock-auth";
import { useMockAuth } from "@/hooks/useMockAuth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Message } from "@/components/ui/Message";

export function LoginForm() {
  const router = useRouter();
  const { isAuthenticated, loadState, login } = useMockAuth();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (loadState === "ready" && isAuthenticated) {
      router.replace("/menu");
    }
  }, [isAuthenticated, loadState, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorMessage("氏名を入力してください。");
      setIsSubmitting(false);
      return;
    }

    if (!password) {
      setErrorMessage("パスワードを入力してください。");
      setIsSubmitting(false);
      return;
    }

    const loggedIn = login(trimmedName, password);

    if (!loggedIn) {
      setName(trimmedName);
      setPassword("");
      setErrorMessage("氏名またはパスワードが正しくありません");
      setIsSubmitting(false);
      return;
    }

    router.push("/menu");
  }

  if (loadState === "loading" || isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-8">
        <p className="text-sm text-[var(--text-secondary)]">
          {isAuthenticated ? "ホームへ移動しています..." : "読み込み中..."}
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-page)] px-4 py-8">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6">
          <p className="text-sm font-black text-[var(--accent-600)]">シフト希望</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-[var(--text-primary)]">
            シフト希望入力モック
          </h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--text-primary)]" htmlFor="name">
              氏名
            </label>
            <input
              autoComplete="name"
              className="min-h-11 w-full rounded-xl border-0 bg-[var(--bg-page)] px-3 py-2 text-[var(--text-primary)] outline-none transition focus:ring-2 focus:ring-[var(--accent-500)]"
              id="name"
              name="name"
              onChange={(event) => setName(event.target.value)}
              type="text"
              value={name}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-bold text-[var(--text-primary)]"
              htmlFor="password"
            >
              パスワード
            </label>
            <input
              autoComplete="current-password"
              className="min-h-11 w-full rounded-xl border-0 bg-[var(--bg-page)] px-3 py-2 text-[var(--text-primary)] outline-none transition focus:ring-2 focus:ring-[var(--accent-500)]"
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </div>

          {errorMessage ? <Message variant="error">{errorMessage}</Message> : null}

          <Button disabled={isSubmitting} fullWidth type="submit">
            {isSubmitting ? "ログイン中..." : "ログイン"}
          </Button>
        </form>

        <div className="mt-6 rounded-2xl bg-[var(--bg-page)] p-4 text-sm text-[var(--text-secondary)]">
          <p className="font-bold text-[var(--text-primary)]">デモ用アカウント</p>
          <p className="mt-2">氏名：{MOCK_USER.name}</p>
          <p>パスワード：{MOCK_USER.password}</p>
        </div>
      </Card>
    </main>
  );
}
