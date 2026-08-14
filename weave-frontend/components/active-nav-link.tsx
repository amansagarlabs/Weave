"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ActiveNavLink({
  href,
  children,
  className = "",
  activeClassName = "",
  ...props
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
} & React.ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={`${className} ${active ? activeClassName : ""}`} {...props}>
      {children}
    </Link>
  );
}
