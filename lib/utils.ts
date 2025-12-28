import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatOrderId(id: string, createdAt: string | Date) {
  const date = new Date(createdAt)
  // YYMMDD format
  const yymmdd = date.getFullYear().toString().slice(-2) +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0')
  const shortId = id.slice(-4).toUpperCase()
  return `${yymmdd}-${shortId}`
}
