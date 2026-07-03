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
        <p className="text-sm text-slate-600">
          {isAuthenticated ? "メニューへ移動しています..." : "読み込み中..."}
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6">
          <p className="text-sm font-semibold text-blue-700">シフト希望</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            シフト希望入力モック
          </h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800" htmlFor="name">
              氏名
            </label>
            <input
              autoComplete="name"
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              id="name"
              name="name"
              onChange={(event) => setName(event.target.value)}
              type="text"
              value={name}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800" htmlFor="password">
              パスワード
            </label>
            <input
              autoComplete="current-password"
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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

        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">デモ用アカウント</p>
          <p className="mt-2">氏名：{MOCK_USER.name}</p>
          <p>パスワード：{MOCK_USER.password}</p>
        </div>
      </Card>
    </main>
  );
}
