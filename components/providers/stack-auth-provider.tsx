"use client";

import { StackProvider } from "@stackframe/stack";
import { stackApp } from "@/lib/stack-client";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function StackAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <StackProvider app={stackApp}>
        {children}
      </StackProvider>
    </TooltipProvider>
  );
}
