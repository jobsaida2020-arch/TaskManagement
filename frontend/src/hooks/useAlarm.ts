import { useEffect, useRef, useState } from "react";
import type { Task } from "../types/task";
import { isOverdue } from "./useCountdown";

export function useAlarm(tasks: Task[]) {
  const [muted, setMuted] = useState(false);
  const [, setTick] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const shouldRing = tasks.some(
    (task) => task.dueDate && task.status !== "DONE" && isOverdue(task.dueDate),
  );

  useEffect(() => {
    if (!shouldRing || muted) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const ctx = audioCtxRef.current ?? new AudioContext();
    audioCtxRef.current = ctx;

    const beep = () => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.frequency.value = 880;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.2);
    };

    beep();
    intervalRef.current = window.setInterval(beep, 1000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [shouldRing, muted]);

  return { muted, toggleMuted: () => setMuted((m) => !m) };
}
