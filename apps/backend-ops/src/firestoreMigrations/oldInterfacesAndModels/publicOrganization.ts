import { OldImgRef } from "./imgRef";

export interface OldPublicOrganization {
  id: string;
  denomination: OldDenomination;
  logo: OldImgRef;
}

interface OldDenomination {
    full: string;
    public?: string;
}