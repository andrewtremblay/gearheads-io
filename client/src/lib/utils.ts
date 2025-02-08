import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** ClassName merge for tailwind */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
