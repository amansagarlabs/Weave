# UPI payment research for Weave

Research date: 29 October 2026

## Goal and current state

Let a brand pay an invoice through UPI, with the money settling to the creator's own merchant account and Weave receiving a verified payment status. An administrator should eventually be able to select a configured provider; changing the default must not affect existing payment attempts. Provider fees and eligibility depend on the creator's merchant agreement and payment method.

The current application uses UniBee for invoice checkout and subscription billing. None of the alternatives or the admin provider switch described below has been implemented yet. Creator-to-brand invoice payments and Weave's subscription billing are separate flows.

## Options

| Option | Assessment | Verification and prerequisites |
| --- | --- | --- |
| Paytm Payment Gateway | Recommended first candidate for automatic UPI confirmation. Paytm advertises zero setup fees and free UPI charges, subject to applicable merchant terms. | Each creator needs a compatible Paytm merchant account. Paytm documents Java integration, webhooks, and payment-status APIs. Confirm account-specific pricing, availability, and onboarding before launch. |
| Cashfree | Alternative payment gateway using payment links. | Each creator connects their own account for direct settlement. Use Cashfree's signed webhooks and verify the amount and payment status. Gateway charges may apply. |
| UPIPay | MIT-licensed Node.js/TypeScript SDK for PhonePe and Paytm APIs. | Requires a compatible merchant account and provider credentials. A Node service would add operational complexity to Weave's Java backend. Validate SDK compatibility with the provider's current API and test in a sandbox before relying on it. |
| YouPI-PG | Experimental self-hosted project for UPI checkout. | Its maintainers say an observed UPI payment is not settlement and require bank-statement reconciliation before treating it as paid. The referenced LICENSE file was unavailable during research; confirm license terms before incorporating its code. |
| UPI QR or intent | A direct way to start a payment. | A QR alone does not provide a trustworthy server-side confirmation; the recipient must verify payment independently or use an approved provider's status API. |

## Recommended approach

1. Integrate Paytm's documented merchant API directly in the Java backend; use a sandbox first. Keep Cashfree as an alternative once separately implemented and tested.
2. Let each creator connect their own provider account. Store credentials using a production secret-management strategy, never in client-side code or committed `.env` files. A single global merchant credential would send payments to the wrong recipient.
3. Represent each payment attempt with its provider, creator, invoice, expected amount and currency, external transaction ID, and status. Retain that provider for subsequent events even if an administrator switches the default.
4. Create a link or checkout for the invoice's net payable amount. Verify the provider's signature, transaction identity, merchant, currency, amount, and final status before marking the invoice paid. Persist and deduplicate incoming events; reconcile uncertain results against the provider's status API.
5. Expose an admin-only provider setting, validate configuration before enabling a provider, and audit changes. An `.env` value can set a deployment default; runtime changes require persistent application settings.
6. Test successful, failed, pending, repeated, delayed, and out-of-order events, wrong amounts and signatures, provider switching, and individual creator settlement in the provider sandbox.

Open decisions before implementation: confirm provider onboarding for individual creators, applicable payment and settlement fees, the desired fallback when a creator has not connected an account, and whether YouPI-PG is needed as a research-only option.

## Sources

- [Paytm pricing](https://business.paytm.com/amp/pricing)
- [Paytm server SDKs](https://business.paytm.com/docs/miniapps/server-sdk/)
- [Paytm callbacks and webhooks](https://business.paytm.com/docs/callback-and-webhook/)
- [Cashfree payment links](https://www.cashfree.com/docs/api-reference/payments/latest/payment-links/create-payment-link) and [webhooks](https://www.cashfree.com/docs/payments/webhooks)
- [UPIPay repository](https://github.com/iamrobinsharaya/upipay)
- [YouPI-PG repository](https://github.com/youpi-pg/YouPI-PG) and [merchant integration guide](https://github.com/youpi-pg/YouPI-PG/blob/main/docs/MERCHANT_INTEGRATION.md)
- [NPCI merchant UPI FAQ](https://www.npci.org.in/what-we-do/upi/faqs)
