import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** i;
  return `${value >= 10 || i === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[i]}`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

function asDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : parseISO(value);
  return isValid(date) ? date : null;
}

export function formatTimeAgo(value: string | Date): string {
  const date = asDate(value);
  if (!date) return "—";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDate(value: string | Date): string {
  const date = asDate(value);
  if (!date) return "—";
  return format(date, "MMM d, yyyy");
}

export function formatShortDateTime(value: string | Date): string {
  const date = asDate(value);
  if (!date) return "—";
  return format(date, "d MMM yyyy, HH:mm");
}

export function formatTimestamp(value: string | Date): string {
  const date = asDate(value);
  if (!date) return "—";
  return format(date, "MMM d, yyyy, h:mm a");
}

export function formatCompactAgo(value: string | Date): string {
  const date = asDate(value);
  if (!date) return "—";
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 45) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 86400 * 7) return `${Math.floor(seconds / 86400)}d ago`;
  return format(date, "MMM d, yyyy");
}

export async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}
