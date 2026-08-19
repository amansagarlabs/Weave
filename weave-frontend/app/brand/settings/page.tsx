import { SurfacePage } from "../../../components/surface";
import { BrandProfileForm } from "../../../components/brand-profile-form";
import { BillingSettingsCard } from "../../../components/billing-settings-card";
import { MfaSettingsCard } from "../../../components/mfa-settings-card";
export default function BrandSettings() { return <SurfacePage role="brand" title="Brand settings." description="Keep your company and billing details up to date."><div className="space-y-6"><BrandProfileForm mode="settings" /><BillingSettingsCard /><MfaSettingsCard /></div></SurfacePage>; }
