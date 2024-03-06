import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function RNN(a:string) {
  const regex1 = /^[\u4e00-\u9fa5]/
  const regex2 = /[\u4e00-\u9fa5][0-9]/
  const regex3 = /[\u4e00-\u9fa5A-Z()]/g
  return a.replace(regex1, "").replace(regex2, "").replace(regex3, "")
}