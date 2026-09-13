import Image from "next/image";
import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-mark.png"
      alt=""
      width={48}
      height={48}
      className={cn("h-12 w-12", className)}
      priority
    />
  );
}

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3.5", className)}>
      <Logo />
      <span className="text-2xl font-medium leading-none tracking-tight text-teal-dark">
        Método Billings
      </span>
    </span>
  );
}
