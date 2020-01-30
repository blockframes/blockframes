import { LegalDocument } from "@blockframes/contract/contract/+state/contract.firestore";
import { Price } from "@blockframes/utils/common-interfaces/price";

/** An interface representing a document of the Expenses collection. */
export interface ExpensesRaw<D>  {
  id: string;
  price: Price;
  date: D;
  /**
   * @dev ie: can be the bill of a meeting in a restaurant
   */
  legalDocuments?: LegalDocument[];

  // @todo #1657 ++ les meme data que ExpenseRaw ?
}

