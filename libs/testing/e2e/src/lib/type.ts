export interface InterceptOption {
  sentTo?: string;
  subject?: string;
  body?: string;
}

export interface User {
  uid: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface Organization {
  id: string;
  email: string;
  address: Location;
  denomination: {
    full: string;
    public: string;
  }
  activity: string;
  fiscalNumber: string;
}