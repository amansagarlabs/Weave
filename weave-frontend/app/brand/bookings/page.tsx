import { SurfacePage } from "../../../components/surface";
import { BookingList } from "../../../components/booking-list";
export default function BrandBookings() { return <SurfacePage role="brand" title="Your bookings." action="Discover creators" actionHref="/brand/discover"><BookingList role="brand" /></SurfacePage>; }
