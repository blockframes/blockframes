import { ImgRef, createImgRef } from "@blockframes/utils/image-uploader";

export interface User {
  uid: string;
  financing: {
    rank: string
  };
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  position: string;
  orgId: string;
  avatar: ImgRef;
  watermark: ImgRef;
}


/** A user interface with public informations */
export interface PublicUser {
  uid: string;
  email: string;
  avatar?: ImgRef;
  watermark?: ImgRef;
  firstName?: string;
  lastName?: string;
  orgId?: string;
}

export function createPublicUser(user: Partial<User> = {}) : PublicUser{
  return {
    uid: user.uid || '',
    email: user.email || '',
    avatar: createImgRef(user.avatar),
    watermark: createImgRef(user.watermark),
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    orgId: user.orgId || ''
  }
}
