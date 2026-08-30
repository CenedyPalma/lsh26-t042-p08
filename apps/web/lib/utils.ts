import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGPA(gpa: number | null | undefined): string {
  if (gpa === null || gpa === undefined || isNaN(gpa)) return '0.00';
  return Number(gpa).toFixed(2);
}
