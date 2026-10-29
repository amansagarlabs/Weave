import { SurfacePage } from "../../../../components/surface";
import { BookingDetail } from "../../../../components/booking-detail";
export default async function BrandBookingDetail({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <SurfacePage role="brand" title={`Booking ${id}`} eyebrow="Booking detail"><BookingDetail id={id} role="brand" /></SurfacePage>; }
