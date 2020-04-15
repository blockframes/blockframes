import { Movie } from "@blockframes/movie/+state";
import { Contract } from "@blockframes/contract/contract/+state/contract.model";
import { DistributionRight } from "@blockframes/distribution-rights/+state/distribution-right.model";

export interface SpreadsheetImportError {
  field: string;
  name: string;
  reason: string;
  type: string;
  hint?: string;
}

export interface MovieImportState {
  movie: Movie;
  errors?: SpreadsheetImportError[];
}

export interface RightsImportState {
  distributionRight: DistributionRight;
  errors?: SpreadsheetImportError[];
  movieTitle: String;
  movieInternalRef?: string;
  movieId: string;
}

export interface ContractsImportState {
  errors?: SpreadsheetImportError[];
  newContract: boolean;
  contract: Contract;
}