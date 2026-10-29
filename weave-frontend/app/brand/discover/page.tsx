import { SurfacePage } from "../../../components/surface";
import { CreatorDiscovery } from "../../../components/creator-discovery";

export default function BrandDiscover() {
  return (
    <SurfacePage
      role="brand"
      title="Discover creators."
      action="View messages"
      actionHref="/brand/messages"
      description="Find people whose work and audience fit your brief. Weave does not use fake AI match percentages."
    >
      <CreatorDiscovery />
    </SurfacePage>
  );
}
