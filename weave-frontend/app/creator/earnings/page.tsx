import { InvoiceList } from "../../../components/invoice-list";
import { SurfacePage } from "../../../components/surface";

export default function CreatorEarnings() {
  return <SurfacePage role="creator" title="Earnings and invoices." description="Track payment links and invoice status without holding funds on Weave."><InvoiceList /></SurfacePage>;
}
