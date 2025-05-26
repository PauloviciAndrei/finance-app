// utils/offlineQueue.ts

import { Transaction } from "../components/Transactions";

export type QueuedAction =
  | { type: "ADD"; payload: Omit<Transaction, "id"> }
  | { type: "UPDATE"; payload: Transaction }
  | { type: "DELETE"; payload: { id: number } };

const QUEUE_KEY = "offlineQueue";

const isQueuedActionArray = (data: unknown): data is QueuedAction[] => {
  return (
    Array.isArray(data) &&
    data.every(
      (item): item is { type: string } =>
        typeof item === "object" &&
        item !== null &&
        "type" in item &&
        ["ADD", "UPDATE", "DELETE"].includes((item as { type: string }).type)
    )
  );
};

export const getQueue = (): QueuedAction[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(QUEUE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    return isQueuedActionArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const addToQueue = (action: QueuedAction) => {
  if (
    (action.type === "UPDATE" || action.type === "DELETE") &&
    (typeof action.payload.id !== "number" || action.payload.id > 100000)
  ) {
    console.warn("❌ Refusing to queue invalid ID:", action.payload.id);
    return;
  }

  const current = getQueue();
  current.push(action);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(current));
};

export const clearQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
};