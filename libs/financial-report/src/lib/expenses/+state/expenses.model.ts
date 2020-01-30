import { LegalDocument } from "@blockframes/contract/contract/+state/contract.firestore";
import { Price } from "@blockframes/utils/common-interfaces/price";
import { Location } from "@blockframes/utils/common-interfaces/utility";

export interface ExpenseDetails {
  contractId: string;
  /** @dev Percentage is need if information is not already in contract */
  percentage?: number;
  /** @dev If we have enough information to link this expense to a specific title of given contractId */
  titleId?: string;
}

/** An interface representing a document of the Expenses collection. */
export interface ExpensesRaw<D>  {
  id: string;
  /** @dev OrgId of the buyer */
  buyerId: string;
  /**
   * @dev Link this expense to one or more contracts (and titles)
   * Example: Hotel room for one night to participate to a movie festival for representing two movies.
   * Room cost is 100€, 50% of the cost will be repercuted to the movie A and 50% to the movie B
   */
  expenseDetails: ExpenseDetails[];
  seller: {
    /** @dev company name  */
    name: string;
    location?: Location,
  }
  price: Price;
  date: D;
  /**
   * @dev ie: can be the bill of a meeting in a restaurant
   */
  legalDocuments: LegalDocument[];
  label: string;
}

