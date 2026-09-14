"use client";

import { Package as PackageIcon } from "lucide-react";
import { Card, Pill } from "../../../../components/ui";
import { Avatar, AvatarImage, AvatarFallback } from "../../../../components/ui/avatar";
type PlatformPreview = { platform: string; handle: string; followers?: number; averageViews?: number; engagementRate?: number };

type PackageInfo = { id: number; contentType: string; price: number; deliveryDays: number };

export function LivePreview({
  displayName,
  publicSlug,
  bio,
  city,
  contentLanguage,
  availabilityStatus,
  categories,
  platforms,
  packages,
  avatarUrl,
}: {
  displayName: string;
  publicSlug: string;
  bio: string;
  city: string;
  contentLanguage: string;
  availabilityStatus: string | null;
  categories: string[];
  platforms: PlatformPreview[];
  packages: PackageInfo[];
  avatarUrl: string | null;
}) {
  const initials = displayName
    ? displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const previewPlatforms = platforms.filter((p) => p.platform || p.handle);

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-[var(--forest)] px-5 py-4 text-white">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-white/60">Live preview</p>
        <h2 className="mt-2 text-2xl font-black tracking-[-.04em]">This is what your public page reads like.</h2>
      </div>

      <div className="space-y-6 p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-none bg-[var(--forest)]">
            {avatarUrl ? <AvatarImage alt="" src={avatarUrl} /> : null}
            <AvatarFallback className="bg-[var(--forest)] text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="text-2xl font-black tracking-[-.04em]">{displayName || "Display name"}</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">weave.in/creator/{publicSlug || "your-slug"}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {city ? <Pill>{city}</Pill> : null}
              {contentLanguage ? <Pill>{contentLanguage}</Pill> : null}
            </div>
          </div>
        </div>

        <div>
          {availabilityStatus === "AVAILABLE" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--forest)]/10 px-3 py-1.5 text-xs font-bold text-[var(--forest)]">
              ✓ Available for deals
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--line)] px-3 py-1.5 text-xs font-bold text-[var(--muted)]">
              Currently unavailable
            </span>
          )}
        </div>

        {categories.length > 0 ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Categories</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((cat) => <Pill key={cat}>{cat}</Pill>)}
            </div>
          </div>
        ) : null}

        {previewPlatforms.length > 0 ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Platforms</p>
            <div className="mt-2 space-y-2">
              {previewPlatforms.map((entry, i) => (
                <div key={`${entry.platform}-${i}`} className="rounded-xl border border-[var(--line)] bg-[var(--card)] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold">{entry.platform || "Platform"}</p>
                      <p className="text-xs text-[var(--muted)]">{entry.handle || "Handle"}</p>
                    </div>
                    {entry.followers != null ? (
                      <div className="text-right">
                        <p className="text-sm font-black tabular-nums">{Number(entry.followers).toLocaleString("en-IN")}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">followers</p>
                      </div>
                    ) : null}
                  </div>
                  <span className="mt-2 inline-block rounded-full bg-[var(--line)] px-2 py-0.5 text-[10px] font-bold text-[var(--muted)]">
                    Manual — not verified
                  </span>
                  {entry.averageViews != null || entry.engagementRate != null ? (
                    <div className="mt-2 flex flex-wrap gap-3 border-t border-[var(--line)] pt-2 text-xs text-[var(--muted)]">
                      {entry.averageViews != null ? <span><strong className="text-[var(--ink)]">{Number(entry.averageViews).toLocaleString("en-IN")}</strong> avg. views</span> : null}
                      {entry.engagementRate != null ? <span><strong className="text-[var(--ink)]">{Number(entry.engagementRate).toLocaleString("en-IN")}%</strong> engagement</span> : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {bio ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">About</p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink)]">{bio}</p>
          </div>
        ) : null}

        {packages.length > 0 ? (
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <PackageIcon size={14} />
            <span className="font-bold">{packages.length} package{packages.length === 1 ? "" : "s"} available</span>
          </div>
        ) : null}

        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--paper)] p-4">
          <p className="text-sm font-bold">Public page note</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Audience metrics stay hidden until the creator has saved them. Weave does not invent performance numbers.</p>
        </div>
      </div>
    </Card>
  );
}
