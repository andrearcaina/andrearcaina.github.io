import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string): string {
  if (!date) return ""

  try {
    const [year, month, day] = date.split('-')
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
    
    const monthName = monthNames[parseInt(month) - 1]
    return `${monthName} ${parseInt(day)}, ${year}`
  } catch {
    return date
  }
}