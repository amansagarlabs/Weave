import { SurfacePage } from "../../../components/surface";
import { BookingList } from "../../../components/booking-list";
export default function CreatorBookings() { return <SurfacePage role="creator" title="Your bookings." action="Find a brand" actionHref="/brand/discover"><BookingList role="creator" /></SurfacePage>; }
