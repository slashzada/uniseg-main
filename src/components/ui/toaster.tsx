import * as React from "react";
import { Toast, ToastAction, ToastClose, ToastTitle, ToastDescription, ToastViewport } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import * as ToastPrimitives from "@radix-ui/react-toast"; // Correct import for ToastPrimitives

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastPrimitives.Provider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        // Map custom variants to default/destructive for shadcn/ui Toast component
        const shadcnVariant = variant === "destructive" ? "destructive" : "default";

        return (
          <Toast key={id} variant={shadcnVariant} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastPrimitives.Viewport />
    </ToastPrimitives.Provider>
  );
}