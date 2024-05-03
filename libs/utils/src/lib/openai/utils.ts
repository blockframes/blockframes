import { Movie, RightholderRole, WaterfallFile, WaterfallRightholder } from "@blockframes/model";

export interface AskContractParams {
  file: WaterfallFile;
  type: RightholderRole;
  rightholders: WaterfallRightholder[];
  movie: Movie;
}

export interface AskContractData {
  licensee: {
    id: string;
    name: string;
  };
  licensor: {
    id: string;
    name: string;
  };
  name: string;
  signatureTimestamp?: number;
  startDateTimestamp?: number;
  endDateTimestamp?: number;
}

export interface AskContractResponse {
  status: boolean;
  data?: AskContractData;
  question: string;
  response?: {
    raw: string;
    json: ExpectedResponse;
  }
  error?: string;
}

export interface ExpectedResponse {
  contractants: {
    vendeur: string,
    acheteur: string
  };
  documentName: string;
  signatureDate: string;
  dateDebut: string;
  dateFin: string;
}