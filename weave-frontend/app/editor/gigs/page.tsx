import { SurfacePage } from "../../../components/surface";
import { PackageMenu } from "../../../components/package-menu";
export default function EditorGigs() { return <SurfacePage role="editor" title="Your editing gigs." action="Add a gig" actionHref="/editor/gigs/new" description="Give creators a clear menu of editing support, pricing, delivery, and revisions."><PackageMenu role="editor" /></SurfacePage>; }
