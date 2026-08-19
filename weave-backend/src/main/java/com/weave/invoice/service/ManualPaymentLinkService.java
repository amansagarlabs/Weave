package com.weave.invoice.service;

import com.weave.invoice.entity.Invoice;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ManualPaymentLinkService implements PaymentLinkService {
    private final String appPublicUrl;

    public ManualPaymentLinkService(@Value("${weave.app.public-url:http://localhost:3000}") String appPublicUrl) {
        this.appPublicUrl = appPublicUrl.replaceAll("/+$", "");
    }

    @Override
    public String createPaymentLink(Invoice invoice) {
        return appPublicUrl + "/brand/bookings/" + invoice.getBookingId() + "?invoiceId=" + invoice.getId();
    }
}
