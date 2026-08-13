import { FormCard, SurfacePage } from "../../../components/surface";
export default function BrandSettings() { return <SurfacePage role="brand" title="Brand settings." description="Keep your company, billing, and communication preferences up to date."><FormCard title="Company and account" fields={["Company name", "Industry", "GSTIN", "Notification email", "Language"]} /></SurfacePage>; }
