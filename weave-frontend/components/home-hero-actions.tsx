"use client";

import { ButtonLink } from "./ui";
import { dashboardHrefForRole, usePublicSession } from "./public-session";
import { homeCopy } from "../lib/copy";

export function HomeHeroActions() {
  const session = usePublicSession();
  const isLoggedIn = session.ready && Boolean(session.token);
  const dashboardHref = dashboardHrefForRole(session.role);

  return (
    <div className="mt-10 flex flex-wrap gap-4">
      <ButtonLink href={isLoggedIn ? dashboardHref : "/onboarding/role"}>
        {isLoggedIn ? "Open workspace" : homeCopy.hero.primaryAction}
      </ButtonLink>
      <ButtonLink href="/brand/discover" variant="outline">
        {homeCopy.hero.secondaryAction}
      </ButtonLink>
    </div>
  );
}
