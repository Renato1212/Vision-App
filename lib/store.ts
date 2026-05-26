import type { StoredReport } from "./types";

declare global {
  // eslint-disable-next-line no-var
  var __O_ESTUDO_STORE: Map<string, StoredReport> | undefined;
  // eslint-disable-next-line no-var
  var __O_ESTUDO_COUNTER: { value: number } | undefined;
}

const store: Map<string, StoredReport> =
  globalThis.__O_ESTUDO_STORE ?? new Map<string, StoredReport>();
const counter: { value: number } =
  globalThis.__O_ESTUDO_COUNTER ?? { value: 0 };

if (process.env.NODE_ENV !== "production") {
  globalThis.__O_ESTUDO_STORE = store;
  globalThis.__O_ESTUDO_COUNTER = counter;
}

export function saveReport(report: StoredReport): void {
  store.set(report.id, report);
}

export function getReport(id: string): StoredReport | undefined {
  return store.get(id);
}

export function nextSerial(): string {
  counter.value += 1;
  return `Estudo n.º ${counter.value.toString().padStart(4, "0")}`;
}
