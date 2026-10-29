"use client";

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import * as React from "react";
import { cn } from "../../lib/utils";

export function ScrollArea({ className, children, ...props }: ScrollAreaPrimitive.Root.Props) {
  return (
    <ScrollAreaPrimitive.Root className={cn("relative overflow-hidden", className)} {...props}>
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-[var(--forest)]">
        <ScrollAreaPrimitive.Content className="min-w-full">{children}</ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar orientation="vertical" className="flex w-2.5 touch-none select-none p-0.5 opacity-70 transition-opacity hover:opacity-100">
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-[var(--forest)]" />
      </ScrollAreaPrimitive.Scrollbar>
      <ScrollAreaPrimitive.Scrollbar orientation="horizontal" className="flex h-2.5 touch-none select-none p-0.5 opacity-70 transition-opacity hover:opacity-100">
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-[var(--forest)]" />
      </ScrollAreaPrimitive.Scrollbar>
      <ScrollAreaPrimitive.Corner className="bg-transparent" />
    </ScrollAreaPrimitive.Root>
  );
}
