
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return "N/A";
  
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) return "Invalid date";
  
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  
  if (diffInSeconds < 0) return "overdue";
  
  const days = Math.floor(diffInSeconds / 86400);
  const hours = Math.floor((diffInSeconds % 86400) / 3600);
  
  if (days > 0) {
    return `in ${days} day${days > 1 ? 's' : ''}`;
  }
  
  if (hours > 0) {
    return `in ${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
