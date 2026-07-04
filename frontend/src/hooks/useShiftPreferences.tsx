"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SHIFT_STORAGE_KEY } from "@/lib/mock-auth";
import { createShiftPreference, isShiftPreferenceArray } from "@/lib/shift";
import {
  readSessionJson,
  removeSessionValue,
  writeSessionJson,
} from "@/lib/session-storage";
import type { ShiftPreference } from "@/types/shift";

type LoadState = "loading" | "ready";
type SaveResult = "created" | "updated";

type ShiftPreferencesContextValue = {
  loadState: LoadState;
  shifts: ShiftPreference[];
  shiftCount: number;
  getShiftByDate: (date: string) => ShiftPreference | undefined;
  upsertShift: (date: string, startTime: string, endTime: string) => SaveResult;
  deleteShift: (date: string) => boolean;
  resetShifts: () => void;
};

const ShiftPreferencesContext = createContext<ShiftPreferencesContextValue | null>(null);

function sortShifts(shifts: ShiftPreference[]) {
  return [...shifts].sort((a, b) => a.date.localeCompare(b.date));
}

export function ShiftPreferencesProvider({ children }: { children: ReactNode }) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [shifts, setShifts] = useState<ShiftPreference[]>([]);
  const shiftsRef = useRef<ShiftPreference[]>([]);

  useEffect(() => {
    const storedShifts = readSessionJson<ShiftPreference[]>(
      SHIFT_STORAGE_KEY,
      isShiftPreferenceArray,
      [],
    );
    const sortedShifts = sortShifts(storedShifts);

    shiftsRef.current = sortedShifts;
    setShifts(sortedShifts);
    setLoadState("ready");
  }, []);

  const persistShifts = useCallback((nextShifts: ShiftPreference[]) => {
    const sortedShifts = sortShifts(nextShifts);
    shiftsRef.current = sortedShifts;
    setShifts(sortedShifts);
    writeSessionJson(SHIFT_STORAGE_KEY, sortedShifts);
  }, []);

  const getShiftByDate = useCallback(
    (date: string) => shiftsRef.current.find((shift) => shift.date === date),
    [],
  );

  const upsertShift = useCallback(
    (date: string, startTime: string, endTime: string): SaveResult => {
      const nextShift = createShiftPreference(date, startTime, endTime);
      const currentShifts = shiftsRef.current;
      const exists = currentShifts.some((shift) => shift.date === date);
      const nextShifts = exists
        ? currentShifts.map((shift) => (shift.date === date ? nextShift : shift))
        : [...currentShifts, nextShift];

      persistShifts(nextShifts);
      return exists ? "updated" : "created";
    },
    [persistShifts],
  );

  const deleteShift = useCallback(
    (date: string) => {
      const currentShifts = shiftsRef.current;
      const exists = currentShifts.some((shift) => shift.date === date);

      if (!exists) {
        return false;
      }

      persistShifts(currentShifts.filter((shift) => shift.date !== date));
      return true;
    },
    [persistShifts],
  );

  const resetShifts = useCallback(() => {
    shiftsRef.current = [];
    setShifts([]);
    removeSessionValue(SHIFT_STORAGE_KEY);
  }, []);

  const value = useMemo<ShiftPreferencesContextValue>(
    () => ({
      loadState,
      shifts,
      shiftCount: shifts.length,
      getShiftByDate,
      upsertShift,
      deleteShift,
      resetShifts,
    }),
    [deleteShift, getShiftByDate, loadState, resetShifts, shifts, upsertShift],
  );

  return (
    <ShiftPreferencesContext.Provider value={value}>
      {children}
    </ShiftPreferencesContext.Provider>
  );
}

export function useShiftPreferences() {
  const context = useContext(ShiftPreferencesContext);

  if (!context) {
    throw new Error("useShiftPreferences must be used within ShiftPreferencesProvider.");
  }

  return context;
}
