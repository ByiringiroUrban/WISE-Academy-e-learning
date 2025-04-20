
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistance } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatTimeAgo(date: Date | string): string {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

export function formatDistanceToNow(date: Date | string): string {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getRandomColor(): string {
  const colors = [
    'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 
    'bg-indigo-100', 'bg-purple-100', 'bg-pink-100', 
    'bg-red-100', 'bg-orange-100'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

export function isPublishedStatus(status?: number): boolean {
  // Status 2 and 3 are both considered "published" states
  return status === 2 || status === 3;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
}
