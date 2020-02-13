import { createPrice, PaymentStatus, formatPayment, formatPrice } from "@blockframes/utils/common-interfaces/price"
import { InvoiceTitleDetails, Invoice } from "./invoice.firestore"
import { formatPaymentSchedule } from "@blockframes/utils/common-interfaces/schedule"
import { createBankAccount } from "@blockframes/utils/common-interfaces/utility"
import { createTerms, formatTerms } from "@blockframes/utils/common-interfaces/terms"
import { toDate } from "@blockframes/utils"

export function createInvoiceTitleDetails(
  params: Partial<InvoiceTitleDetails> = {}
): InvoiceTitleDetails {
  return {
    titleId: '',
    ...params,
    price: createPrice(params.price),
  }
}

export function formatInvoiceTitleDetails(detail: any): InvoiceTitleDetails {
  return {
    ...detail,
    price: formatPrice(detail.price)
  };
}

export function createInvoice(
  params: Partial<Invoice> = {}
): Invoice {
  return {
    id: '',
    internalRef: '',
    payments: [],
    emittedDate: new Date(),
    titles: [],
    buyerId: '',
    sellerId: '',
    status: PaymentStatus.unknown,
    contractId: '',
    legalDocumentId: '',
    reportIds: [],
    reportInternalRefs: [],
    ...params,
    price: createPrice(params.price),
    collected: createPrice(params.collected),
    paymentTerm: createTerms(params.paymentTerm),
    account: createBankAccount(params.account),
  }
}

export function createInvoiceFromFirestore(invoice: any): Invoice {
  return {
    ...invoice,
    payments: invoice.payments.map(p => formatPayment(p)),
    emittedDate: toDate(invoice.emittedDate),
    titles: invoice.titles.map(t => formatInvoiceTitleDetails(t)),
    price: invoice.price ? formatPrice(invoice.price) : createPrice(),
    collected: formatPrice(invoice.collected),
    paymentSchedule: formatPaymentSchedule(invoice.paymentSchedule),
    paymentTerm: invoice.paymentTerm ? formatTerms(invoice.paymentTerm) : createTerms(),
  } as Invoice;
}