import { OldImgRef } from "./imgRef";

export interface OldPublicUser {
  uid: string;
  email: string;
  avatar?: OldImgRef;
  watermark?: OldImgRef;
  firstName?: string;
  lastName?: string;
  orgId?: string;
}