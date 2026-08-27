import { ReactNode } from "react";

export function PhoneFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-[44px] bg-ink p-3 shadow-2xl shadow-black/25 ring-1 ring-black/10 ${className}`}
    >
      <div className="relative overflow-hidden rounded-[32px]">{children}</div>
    </div>
  );
}
