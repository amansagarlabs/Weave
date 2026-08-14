import { Card } from "../../../components/ui";
import { StandardEmpty, SurfacePage, Tabs } from "../../../components/surface";

export default function AdminDisputes() {
  return (
    <SurfacePage
      role="admin"
      title="Disputes and flags."
      eyebrow="Admin"
      description="Review escalations, evidence, and manual moderation notes here."
    >
      <Tabs labels={["Open", "Reviewing", "Resolved"]} />

      <Card className="mt-6">
        <StandardEmpty
          title="No open disputes."
          copy="Flagged cases will show their evidence timeline, internal notes, and resolution action here."
          href="/admin/users"
          action="View users"
        />
      </Card>
    </SurfacePage>
  );
}
