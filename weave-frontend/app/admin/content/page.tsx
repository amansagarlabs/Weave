import { Card, Pill } from "../../../components/ui";
import { SurfacePage } from "../../../components/surface";

const categories = ["All", "Tech", "Fashion", "Lifestyle", "Gaming", "Fitness", "Travel", "Beauty"];

export default function AdminContent() {
  return (
    <SurfacePage
      role="admin"
      title="Content and taxonomy."
      eyebrow="Admin"
      description="Keep the public platform copy and the fixed discovery taxonomy aligned across the product."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-black tracking-[-.04em]">Category taxonomy</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            The discovery surface uses the locked categories below. This list is displayed here for review and future admin editing.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Pill key={category}>{category}</Pill>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-black tracking-[-.04em]">Editable content blocks</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Compliance copy, help text, and public-facing labels will live here once the persistence layer is connected.
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-6">
            <li className="rounded-2xl bg-[var(--paper)] px-4 py-3 font-bold">Public hero copy</li>
            <li className="rounded-2xl bg-[var(--paper)] px-4 py-3 font-bold">Disclosure checklist text</li>
            <li className="rounded-2xl bg-[var(--paper)] px-4 py-3 font-bold">Help center entries</li>
            <li className="rounded-2xl bg-[var(--paper)] px-4 py-3 font-bold">Category labels and descriptions</li>
          </ul>
        </Card>
      </div>
    </SurfacePage>
  );
}
