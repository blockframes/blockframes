export interface User {
  uid: string;
  financing: {
    rank: string
  };
  email: string;
  name: string;
  surname: string;
  phoneNumber: string;
  position: string;
  orgId: string;
  avatar: string;
}

/** A user interface with public informations */
export interface PublicUser {
  uid: string;
  email: string;
  avatar?: string;
  name?: string;
  surname?: string;
  orgId?: string;
}
