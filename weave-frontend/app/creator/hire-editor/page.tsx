import { EditorDiscovery } from "../../../components/editor-discovery";
import { SurfacePage } from "../../../components/surface";

export default function HireEditor() {
  return <SurfacePage role="creator" title="Find an editor." description="Browse editing partners by craft, price, delivery time, and revision policy.">
    <div className="mb-6 flex flex-wrap gap-3"><button className="rounded-full bg-[var(--ink)] px-4 py-3 text-sm font-bold text-white">All specialties</button><button className="rounded-full bg-white px-4 py-3 text-sm font-bold">Reels</button><button className="rounded-full bg-white px-4 py-3 text-sm font-bold">Photo</button></div>
    <EditorDiscovery />
  </SurfacePage>;
}
