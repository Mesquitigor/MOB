import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn("h-9 w-9", className)}
      {...props}
    >
      <rect width="40" height="40" rx="14" fill="#14686E" />
      <path
        d="M20 30s-8.2-5.1-11.4-10.2C6.2 16.1 7.1 11.8 11 10.6c2.2-.7 4.5.1 5.8 2 1.3-1.9 3.6-2.7 5.8-2 3.9 1.2 4.8 5.5 2.4 9.2C28.2 24.9 20 30 20 30z"
        fill="#F6EFE4"
      />
      <circle cx="20" cy="18.5" r="3.1" fill="#F23D8A" />
    </svg>
  );
}
