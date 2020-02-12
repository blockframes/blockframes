import { firestore } from "firebase/app";
import { PriceRaw, PaymentStatus, PaymentRaw } from "@blockframes/utils/common-interfaces/price";
import { PaymentScheduleRaw } from "@blockframes/utils/common-interfaces/schedule";
import { TermsRaw } from "@blockframes/utils/common-interfaces/terms";
import { BankAccount } from "@blockframes/utils/common-interfaces/utility";

type Timestamp = firestore.Timestamp;

export interface InvoiceTitleDetailsRaw<D> {
    price: PriceRaw<D>;
    reportId?: string;
    titleId: string;
}

export interface InvoiceTitleDetails extends InvoiceTitleDetailsRaw<Date> {
}

export interface InvoiceTitleDetailsDocument extends InvoiceTitleDetailsRaw<Timestamp> {
}

export interface InvoiceRaw<D> {
    id: string,
    internalRef: string,
    /** @dev should be comming from blockchain data */
    paymentRef?: string,
    payments: PaymentRaw<D>[],
    emittedDate: D,
    /** @dev Contains Ids of titles that this invoice is about */
    titles: InvoiceTitleDetailsRaw<D>[],
    /** @dev Expected price once each payments have been made */
    price: PriceRaw<D>,
    /**
     * @dev Collected amount (sum of payments.price).
     * A function should handle this.
     * Start with zero.
     */
    collected: PriceRaw<D>,
    /** @dev an orgId */
    buyerId: string,
    /** @dev an orgId */
    sellerId: string,
    /** @dev informations about payment date */
    paymentSchedule: PaymentScheduleRaw<D>,
    /** @dev payment conditions */
    paymentTerm: TermsRaw<D>,
    /**
     * @dev Status calculated with price - collected
     * A function should handle this.
     * Start with PaymentStatus.notdueyet
     */
    status: PaymentStatus,
    interestRate?: number,
    /** @dev should be one of the buyerId bank accounts */
    account: BankAccount,
    contractId: string,
    /** @dev should be a legal document belonging to contractId */
    legalDocumentId: string,
    /**
     * @dev
     * reportIds : array of FinancialReport ids
     * reportInternalRefs : array of FinancialReport interalRef
     */
    reportIds: string[],
    reportInternalRefs: string[],
}

export interface Invoice extends InvoiceRaw<Date> {
}

export interface InvoiceDocument extends InvoiceRaw<Timestamp> {
}
