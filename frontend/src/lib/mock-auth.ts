export const AUTH_STORAGE_KEY = "shift-mock-auth:v1";
export const SHIFT_STORAGE_KEY = "shift-mock-shifts:v1";

export const MOCK_USER = {
  name: "山田太郎",
  password: "shift1234",
} as const;

export type MockAuthSession = {
  name: string;
};

export function isMockAuthSession(value: unknown): value is MockAuthSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Partial<MockAuthSession>;
  return typeof session.name === "string" && session.name.length > 0;
}
