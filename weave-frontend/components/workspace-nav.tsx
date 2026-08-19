import Link from "next/link";
import { BriefcaseBusiness, Compass, Home, Images, Inbox, Users, WalletCards } from "lucide-react";

export type Role = "creator" | "brand" | "editor" | "admin";

export const roleMeta: Record<Role, { label: string; accent: string; dashboard: string }> = {
  creator: { label: "Creator workspace", accent: "Your work, your way.", dashboard: "/creator/dashboard" },
  brand: { label: "Brand workspace", accent: "Find the right fit.", dashboard: "/brand/dashboard" },
  editor: { label: "Editor workspace", accent: "Make good work better.", dashboard: "/editor/dashboard" },
  admin: { label: "Admin workspace", accent: "Keep Weave healthy.", dashboard: "/admin/dashboard" },
};

export function WeaveMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--orange)] shadow-[0_1px_3px_rgba(18,35,31,0.14)] ${className}`}
    >
      <svg
        fill="none"
        height="24"
        viewBox="0 0 48 48"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
        className="block"
      >
        <path
          clipRule="evenodd"
          d="m16.1746 28.4936 4.5688 4.5688c2.7804 2.7803 7.2882 2.7803 10.0686 0 .9169-.917 1.5315-2.0218 1.8436-3.1906l3.1906 3.1906c2.7804 2.7803 7.2882 2.7803 10.0685 0 2.7804-2.7804 2.7804-7.2882 0-10.0685l-10.0685-10.0686c-2.7803-2.7803-7.2882-2.7803-10.0685 0-.917.917-1.5315 2.0219-1.8436 3.1907l-3.1907-3.1907c-2.7803-2.7803-7.2881-2.7803-10.0685.0001l-8.28554 8.2855c-3.185813 3.1858-3.185813 8.351 0 11.5369 3.18581 3.1858 8.35104 3.1858 11.53684 0 1.206-1.206 1.9555-2.6957 2.2484-4.2542zm2.0517-13.0511c-1.3902-1.3902-3.6441-1.3902-5.0343 0-1.3895 1.3896-1.3901 3.6421-.0017 5.0325l10.0703 10.0703c1.3901 1.3901 3.6441 1.3901 5.0342 0 1.3895-1.3895 1.3902-3.6417.0022-5.0321zm-6.8172 8.2855-3.25132-3.2513-3.25129 3.2513c-1.79564 1.7957-1.79564 4.707 0 6.5026 1.79564 1.7957 4.70695 1.7957 6.50261 0 1.7956-1.7956 1.7956-4.7069 0-6.5026zm16.8828-3.2542c-1.3872-1.3904-1.3863-3.6421.0029-5.0313 1.3902-1.3902 3.6441-1.3902 5.0343 0l10.0685 10.0685c1.3902 1.3902 1.3902 3.6441 0 5.0343-1.3902 1.3901-3.6441 1.3901-5.0342 0z"
          fill="currentColor"
          fillRule="evenodd"
          transform="rotate(180 24 24)"
        />
      </svg>
    </span>
  );
}

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Weave home"
      className="inline-flex min-h-11 items-center gap-2.5 rounded-lg text-2xl font-black tracking-[-0.055em] focus-visible:outline-offset-4"
    >
      <WeaveMark />
      <span>
        weave<span className="text-[var(--orange)]">.</span>
      </span>
    </Link>
  );
}

export const nav: Record<Role, Array<[string, string]>> = {
  creator: [
    ["Home", "/creator/dashboard"],
    ["Bookings", "/creator/bookings"],
    ["Messages", "/creator/messages"],
    ["Portfolio", "/creator/portfolio"],
    ["Hire an editor", "/creator/hire-editor"],
    ["Earnings", "/creator/earnings"],
  ],
  brand: [
    ["Home", "/brand/dashboard"],
    ["Discover", "/brand/discover"],
    ["Messages", "/brand/messages"],
    ["Bookings", "/brand/bookings"],
  ],
  editor: [
    ["Home", "/editor/dashboard"],
    ["Requests", "/editor/requests"],
    ["Gigs", "/editor/gigs"],
    ["Earnings", "/editor/earnings"],
  ],
  admin: [
    ["Dashboard", "/admin/dashboard"],
    ["Users", "/admin/users"],
    ["Organizations", "/admin/organizations"],
    ["Disputes", "/admin/disputes"],
    ["Content", "/admin/content"],
    ["Operations", "/admin/operations"],
    ["Audit log", "/admin/audit"],
    ["RBAC policies", "/admin/rbac"],
  ],
};

export const navIcons = {
  Home,
  Bookings: BriefcaseBusiness,
  Messages: Inbox,
  Portfolio: Images,
  "Hire an editor": Compass,
  Earnings: WalletCards,
  Discover: Compass,
  Requests: Inbox,
  Gigs: BriefcaseBusiness,
  Users: Home,
  Dashboard: Home,
  Organizations: BriefcaseBusiness,
  "Audit log": WalletCards,
  "RBAC policies": Users,
  Disputes: BriefcaseBusiness,
  Content: WalletCards,
} as const;
