# Project Overview

シフト希望入力モックアプリ。従業員がログインし、カレンダーから勤務可能時間を登録・確認する UI の検証を目的とする。

- Next.js 16 (App Router) / React 19 / TypeScript 5 / Tailwind CSS v4 (PostCSS プラグイン)
- カレンダーは `@daypicker/react` v10（`react-day-picker` ではない）
- バックエンド・API・DB・本番用認証・環境変数は存在しない。状態は React Context と `sessionStorage` のみ
- デプロイは Vercel（プロジェクトルートを `frontend` に設定）

# Repository Structure

リポジトリ直下は `README.md` と `frontend/` のみ。`backend/` は存在しない。npm パッケージは `frontend/` の 1 つだけなので、**すべてのコマンドは `frontend/` で実行する**。

```
frontend/
  app/                      App Router。ルート定義と globals.css のみ
    page.tsx                / … ログイン画面
    (protected)/            AuthGuard + AppHeader を適用する認証必須セグメント
      menu/                 /menu … ホーム（入力・確認を 1 画面で切替）
      shifts/input/         /shifts/input
      shifts/confirm/       /shifts/confirm
    globals.css             Tailwind import・CSS 変数・`.app-*` / `.shift-*` クラス
  src/components/           画面コンポーネントと UI プリミティブ（auth, layout, menu, providers, shifts, ui）
  src/hooks/                Context Provider と `use~` フック（.tsx）
  src/lib/                  React 非依存の純粋ロジック（date, shift, session-storage, mock-auth）
  src/types/                共有型
```

パスエイリアスは `@/*` → `frontend/src/*`（`tsconfig.json`）。`app/` 配下にエイリアスはなく、`app/` からも `@/components/...` で参照する。

# Development Environment

- package manager: **npm**（`frontend/package-lock.json`, lockfileVersion 3）。yarn / pnpm の lock は無い
- `engines` / `packageManager` の指定は無し
- Docker, Makefile, CI 設定, `.env` ファイル, マイグレーションは存在しない
- Next.js 関連バイナリは `frontend/node_modules/.bin/`（next, eslint, tsc）

# Commands

`frontend/` で実行する。`package.json` の scripts は以下がすべて。

| 目的 | コマンド |
| --- | --- |
| install | `npm install` |
| dev | `npm run dev` （http://localhost:3000） |
| build | `npm run build` |
| 本番起動 | `npm start` |
| lint | `npm run lint` （= `eslint`、flat config + `eslint-config-next`） |

- typecheck 用の script は未定義。型だけ確認したい場合は `npx tsc --noEmit`（`tsconfig.json` は `noEmit: true`）
- テストランナーは未導入。テストファイル・テスト設定は存在しない

**これらのコマンドは、ユーザーが明示的に依頼したときだけ実行する**（`frontend/AGENTS.md` の方針）。

# Architecture

レイヤと依存方向は一方向：`app/` → `components/` → `hooks/` → `lib/` → `types/`。逆流させない。`src/lib/` は React / Next を import しない。

1. **`app/**/page.tsx`** … Server Component の薄いラッパー。状態を持たず、対応する `src/components/<domain>/<Name>Page.tsx` を描画するだけ。`searchParams` は Promise なので `await` する（`app/(protected)/shifts/input/page.tsx`）
2. **`src/components/**/*Page.tsx`** … `"use client"` の画面コンポーネント。ローカル state・ハンドラ・トーストなどの UI 状態を持つ
3. **`src/hooks/*.tsx`** … Context Provider と `use~` フックを同一ファイルに定義し、`AppProviders` が root layout で合成する。`sessionStorage` に触れるのはこの層だけ
4. **`src/lib/*.ts`** … 純粋関数・バリデーション・type guard

プロジェクト固有の前提：

- **認証はクライアントのみのモック**。`AuthGuard`（`app/(protected)/layout.tsx`）が未認証なら `/` へ `router.replace`。middleware もサーバー側チェックも無い
- **永続化は `sessionStorage` だけ**。キーは `src/lib/mock-auth.ts` の `AUTH_STORAGE_KEY` / `SHIFT_STORAGE_KEY`（`:v1` 付き）。保存形式を変えるならキーの版を上げ、対応する type guard も更新する
- **ハイドレーション後に読み込む**。Provider は初期値を空にして `useEffect` で復元し、`loadState: "loading" | "ready"` を公開する。読み込み中の表示を必ず用意する
- **日付は `YYYY-MM-DD` のローカル日付キー文字列が正**（`src/lib/date.ts` の `toLocalDateKey` / `parseLocalDateKey`）。`Date#toISOString()` から日付キーを作らない（UTC ずれ）。比較・ソートは文字列比較で行う
- 新しい画面は `app/(protected)/<route>/page.tsx` を追加し、実体を `src/components/<domain>/` に置く
- 新しい業務ロジックは `src/lib/` に純粋関数として追加し、コンポーネントから呼ぶ

# Coding Conventions

- export は名前付き。`export default` は `app/` の Page / Layout のみ
- 型は `type` エイリアスで書く（`interface` は未使用）。バリアントは `Record<Variant, string>` のマップ（`src/components/ui/Button.tsx`）
- import は必ず `@/...` の絶対パス（相対 import は 1 つも無い）
- `"use client"` は state / hooks / イベントハンドラを使うファイルの先頭に付ける。`src/components/ui/` の純表示プリミティブには付けない
- スタイルは Tailwind ユーティリティ + `var(--token)` の CSS 変数。新しい色リテラルを足さず `app/globals.css` の変数を使う。繰り返すパターンは `.app-*` / `.shift-*` クラスへ
- クラス結合は配列 + `.join(" ")`（clsx などは未導入）
- UI 文言・エラーメッセージは日本語。入力検証は「エラーメッセージ文字列 or `null`」を返す関数に集約する（`getShiftValidationError`）
- 外部（`sessionStorage`）から復元する値には type guard を書き、`readSessionJson` に渡す（`isShiftPreferenceArray`, `isMockAuthSession`）
- タップ対象は `min-h-11` 以上、フォーカスは `focus-visible:outline-*` を既存に合わせる
- シフト時刻は 09:00〜20:00 / 15 分刻み / 30 分以上という制約が `src/lib/shift.ts` に集約されている。UI 側で別の定数を再定義しない

# Testing and Validation

自動テストは存在しないため、検証は**差分とソースの読み直し**で行う（ユーザーの指示が無い限りコマンドは実行しない）。最低限、次を確認する。

- 未使用 import / 壊れた JSX / props と型の不一致
- hooks を使う新規コンポーネントへの `"use client"` の付け忘れ
- 日付がローカル日付キーとして扱われているか
- `sessionStorage` のキーと type guard の整合（形式変更時は版を上げたか）
- 参照しているルートが実在するか（`/`, `/menu`, `/shifts/input`, `/shifts/confirm`）
- `loadState === "loading"` の分岐を潰していないか

ユーザーが検証を求めた場合は `frontend/` で `npm run lint` → `npm run build`（README の手順）。テストを追加したい場合は、ランナーの新規導入になるため事前に方針を確認する。

# Workflow

1. 変更対象の `app/` のルートと、対応する `src/components/` の実体を両方読む
2. 同種の既存実装を探して合わせる（フォームなら `ShiftForm`、カレンダーなら `ShiftConfirmCalendar`、永続化なら `useShiftPreferences`）
3. 純粋ロジックは `src/lib/` に置き、コンポーネントは表示と状態遷移に絞る
4. 既存の `Button` / `Card` / `Message` / Context を再利用し、独自の抽象・状態ストア・ユーティリティを新設しない
5. 上記 Testing and Validation に従って自己検証する
6. `git diff` を読み直す

Next.js の API を書く前に `frontend/node_modules/next/dist/docs/` の該当ガイドを読む（このバージョンは学習データと差異がある。`frontend/AGENTS.md` 参照）。

# Boundaries

- `package-lock.json` を手で編集しない。依存の変更は npm 経由で、かつ必要性が明確なときだけ（現在の dependencies は 4 つ）
- 日付処理・クラス結合・状態管理のためにライブラリを追加しない（それぞれ `src/lib/date.ts`、`join(" ")`、Context で足りている）
- `frontend/AGENTS.md` の `<!-- BEGIN:nextjs-agent-rules -->` 〜 `<!-- END:nextjs-agent-rules -->` は Next.js が生成・更新するブロック。手で書き換えない
- `MOCK_USER` の資格情報がクライアントに露出しているのは意図的な仕様（README に明記）。「セキュリティ修正」として作り替えない。実認証・API・DB の導入は依頼があったときだけ
- `.next/`, `next-env.d.ts` などの生成物を編集・コミットしない
- 秘密情報や `.env` を追加しない（このアプリは環境変数を使わない）
- 依頼されていないリファクタ（デザイン刷新、ディレクトリ再編）をしない
- CI / インフラ設定は存在しない。求められない限り新設しない
- 明示的な指示が無い限り `git commit` / `git push` をしない

# Canonical References

新しいコードは以下を模倣する。

- ルート定義（`searchParams` の await）… `frontend/app/(protected)/shifts/input/page.tsx`
- 画面コンポーネント … `frontend/src/components/shifts/ShiftInputPage.tsx`
- フォーム・検証・プリセット … `frontend/src/components/shifts/ShiftForm.tsx`
- Context + `sessionStorage` 永続化 … `frontend/src/hooks/useShiftPreferences.tsx`
- 純粋ロジックと type guard … `frontend/src/lib/shift.ts`, `frontend/src/lib/date.ts`
- UI プリミティブとバリアント … `frontend/src/components/ui/Button.tsx`
- DayPicker のラップ・カスタム DayButton … `frontend/src/components/shifts/ShiftConfirmCalendar.tsx`
- デザイントークンとグローバルクラス … `frontend/app/globals.css`

# Planning

複数画面にまたがる変更、ルート構成の変更、永続化スキーマの変更、カレンダーライブラリの差し替え、依存追加では、実装前に影響ファイルを列挙し、手順・データ移行（`sessionStorage` キーの版上げ）・リスクを提示して合意を取る。表示調整や 1 ファイルで完結する修正では計画を省く。
