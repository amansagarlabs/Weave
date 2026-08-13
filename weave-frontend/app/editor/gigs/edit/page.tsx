import { FormCard, SurfacePage } from "../../../../components/surface";
export default function EditEditorGig() { return <SurfacePage role="editor" title="Edit your gig." eyebrow="Gig menu"><FormCard title="Reel edit" fields={["Package tier", "Service name", "Price in INR", "Delivery days", "Revisions included", "Included services"]} /></SurfacePage>; }
