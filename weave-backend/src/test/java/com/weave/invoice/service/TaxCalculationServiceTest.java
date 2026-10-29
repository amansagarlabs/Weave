package com.weave.invoice.service;

import com.weave.invoice.entity.TaxRule;
import com.weave.invoice.repository.TaxRuleRepository;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TaxCalculationServiceTest {
    @Test
    void calculatesConfiguredGstAndTdsWithoutHardcodedFrontendRates() {
        TaxRuleRepository rules = mock(TaxRuleRepository.class);
        TaxRule gst = mock(TaxRule.class); when(gst.getRate()).thenReturn(new BigDecimal("18.0000"));
        TaxRule tds = mock(TaxRule.class); when(tds.getRate()).thenReturn(new BigDecimal("10.0000"));
        when(rules.findByCodeAndActiveTrue("GST_STANDARD")).thenReturn(Optional.of(gst));
        when(rules.findByCodeAndActiveTrue("TDS_SERVICE")).thenReturn(Optional.of(tds));
        TaxCalculationService.TaxBreakdown result = new TaxCalculationService(rules).calculate(new BigDecimal("10000.00"), true, true);
        assertEquals(new BigDecimal("18.0000"), result.gstRate());
        assertEquals(new BigDecimal("1800.00"), result.gstAmount());
        assertEquals(new BigDecimal("1000.00"), result.tdsAmount());
        assertEquals(new BigDecimal("10800.00"), result.netPayable());
    }

    @Test
    void leavesTaxesAtZeroWhenFlagsAreDisabled() {
        TaxRuleRepository rules = mock(TaxRuleRepository.class);
        TaxCalculationService.TaxBreakdown result = new TaxCalculationService(rules).calculate(new BigDecimal("999.99"), false, false);
        assertEquals(BigDecimal.ZERO, result.gstRate()); assertEquals(BigDecimal.ZERO.setScale(2), result.gstAmount()); assertEquals(new BigDecimal("999.99"), result.netPayable()); verifyNoInteractions(rules);
    }
}
