import { AdminDisputesPanel } from "../../../components/admin-disputes-panel";
import { SurfacePage } from "../../../components/surface";

export default function AdminDisputes() {
  return (
    <SurfacePage
      role="admin"
      title="Disputes and flags."
      eyebrow="Admin"
      description="Review escalations, evidence, and manual moderation notes here."
    >
      <AdminDisputesPanel />
    </SurfacePage>
  );
}
