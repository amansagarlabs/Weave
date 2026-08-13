import { FormCard, SurfacePage } from "../../../../components/surface";
export default function CreatorProfileEdit() { return <SurfacePage role="creator" title="Edit your public profile." action="Preview profile" actionHref="/creator/sample"><FormCard title="Profile details" fields={["Display name", "Bio", "Categories", "City", "Availability", "Public profile slug"]} /></SurfacePage>; }
