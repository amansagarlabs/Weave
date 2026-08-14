package com.weave.invoice.controller;

import com.weave.invoice.dto.CreateInvoiceRequest;
import com.weave.invoice.dto.InvoiceResponse;
import com.weave.invoice.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/invoices")
public class InvoiceController {
    private final InvoiceService invoices;
    public InvoiceController(InvoiceService invoices) { this.invoices = invoices; }
    @GetMapping @PreAuthorize("hasAnyRole('BRAND', 'CREATOR')") List<InvoiceResponse> mine(Authentication authentication) { return invoices.mine(authentication.getName()); }
    @PostMapping @PreAuthorize("hasRole('CREATOR')") InvoiceResponse create(@Valid @RequestBody CreateInvoiceRequest request, Authentication authentication) { return invoices.create(authentication.getName(), request); }
    @PostMapping("/{id}/send") @PreAuthorize("hasRole('CREATOR')") InvoiceResponse send(@PathVariable Long id, Authentication authentication) { return invoices.send(authentication.getName(), id); }
}
