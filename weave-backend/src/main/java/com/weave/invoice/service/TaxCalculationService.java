package com.weave.invoice.service;

import com.weave.invoice.repository.TaxRuleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class TaxCalculationService {
    private final TaxRuleRepository rules;
    public TaxCalculationService(TaxRuleRepository rules) { this.rules = rules; }
    public TaxBreakdown calculate(BigDecimal amount, boolean gstRegistered, boolean tdsApplicable) {
        BigDecimal gstRate = gstRegistered ? rate("GST_STANDARD") : BigDecimal.ZERO;
        BigDecimal tdsRate = tdsApplicable ? rate("TDS_SERVICE") : BigDecimal.ZERO;
        BigDecimal gst = amount.multiply(gstRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal tds = amount.multiply(tdsRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return new TaxBreakdown(gstRate, gst, tdsRate, tds, amount.add(gst).subtract(tds).setScale(2, RoundingMode.HALF_UP));
    }
    private BigDecimal rate(String code) { return rules.findByCodeAndActiveTrue(code).map(rule -> rule.getRate()).orElseThrow(() -> new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Tax rule is not configured: " + code)); }
    public record TaxBreakdown(BigDecimal gstRate, BigDecimal gstAmount, BigDecimal tdsRate, BigDecimal tdsAmount, BigDecimal netPayable) { }
}
