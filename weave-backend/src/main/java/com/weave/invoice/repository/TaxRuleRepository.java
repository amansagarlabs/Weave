package com.weave.invoice.repository;

import com.weave.invoice.entity.TaxRule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TaxRuleRepository extends JpaRepository<TaxRule, Long> {
    Optional<TaxRule> findByCodeAndActiveTrue(String code);
}
