import { SurfacePage } from "../../../components/surface";
import { PackageMenu } from "../../../components/package-menu";
export default function CreatorPackages() { return <SurfacePage role="creator" title="Your package menu." action="Add package" actionHref="/creator/packages/new" description="Make your offers clear with fixed prices, delivery times, and revision expectations."><PackageMenu /></SurfacePage>; }
