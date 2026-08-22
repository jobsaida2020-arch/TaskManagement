import { useEffect, useState } from "react";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;
const THREE_DAYS_MS = 3 * ONE_DAY_MS;

function deadlineOf(dueDate: string): Date {
  const [year, month, day] = dueDate.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}

export function isOverdue(dueDate: string): boolean {
  return deadlineOf(dueDate).getTime() - Date.now() <= 0;
}

export function formatCountdown(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;
  const time = [hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(":");
  return days > 0 ? `${days}日 ${time}` : time;
}

export interface CountdownState {
  msRemaining: number;
  isOverdue: boolean;
  isUrgent: boolean;
  isWithin7Days: boolean;
}

export function useCountdown(dueDate: string | null): CountdownState | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!dueDate) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [dueDate]);

  if (!dueDate) return null;

  const msRemaining = deadlineOf(dueDate).getTime() - now;

  return {
    msRemaining,
    isOverdue: msRemaining <= 0,
    isUrgent: msRemaining <= THREE_DAYS_MS,
    isWithin7Days: msRemaining <= SEVEN_DAYS_MS,
  };
}
