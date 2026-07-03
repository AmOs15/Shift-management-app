type Validator<T> = (value: unknown) => value is T;

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function readSessionJson<T>(
  key: string,
  validate: Validator<T>,
  fallback: T,
): T {
  if (!canUseSessionStorage()) {
    return fallback;
  }

  const rawValue = window.sessionStorage.getItem(key);

  if (!rawValue) {
    return fallback;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (validate(parsedValue)) {
      return parsedValue;
    }
  } catch (error) {
    console.warn(`Failed to parse sessionStorage value for ${key}.`, error);
  }

  window.sessionStorage.removeItem(key);
  return fallback;
}

export function writeSessionJson<T>(key: string, value: T) {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function removeSessionValue(key: string) {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.removeItem(key);
}
