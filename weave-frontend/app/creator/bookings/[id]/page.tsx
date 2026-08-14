import { SurfacePage } from "../../../../components/surface";
import { BookingDetail } from "../../../../components/booking-detail";
export default async function CreatorBookingDetail({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <SurfacePage role="creator" title={`Booking ${id}`} eyebrow="Booking detail"><BookingDetail id={id} role="creator" /></SurfacePage>; }
