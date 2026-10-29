import { AdminContentManager } from "../../../components/admin-content-manager";
import { SurfacePage } from "../../../components/surface";

export default function AdminContent() {
  return (
    <SurfacePage
      role="admin"
      title="Content and taxonomy."
      eyebrow="Admin"
      description="Keep the public platform copy and the fixed discovery taxonomy aligned across the product."
    >
      <AdminContentManager />
    </SurfacePage>
  );
}
