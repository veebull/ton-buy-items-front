"use client"

import { toast } from "sonner"
import { logger } from "@/lib/logger"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success" | "warning" | "info"
}

export function useToast() {
  const showToast = ({ title, description, variant = "default" }: ToastProps) => {
    // Map variant to sonner toast type
    const type = variant === "destructive" ? "error" : 
                 variant === "success" ? "success" :
                 variant === "warning" ? "warning" :
                 variant === "info" ? "info" : undefined

    // Log the toast
    logger.info("Toast shown:", { title, description, type })

    // Show toast using sonner with top-center position
    if (title && description) {
      if (type) {
        toast[type](title, { description, position: "top-center" })
      } else {
        toast(title, { description, position: "top-center" })
      }
    } else if (title) {
      if (type) {
        toast[type](title, { position: "top-center" })
      } else {
        toast(title, { position: "top-center" })
      }
    }
  }

  return {
    toast: showToast
  }
}
