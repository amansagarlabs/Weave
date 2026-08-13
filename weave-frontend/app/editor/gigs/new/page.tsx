import { FormCard, SurfacePage } from "../../../../components/surface";
export default function NewEditorGig() { return <SurfacePage role="editor" title="Add an editing gig." eyebrow="Gig menu"><FormCard title="Gig details" fields={["Package tier", "Service name", "Price in INR", "Delivery days", "Revisions included", "Included services"]} /></SurfacePage>; }
