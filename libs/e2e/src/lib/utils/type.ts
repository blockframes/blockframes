export interface User {
  uid: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface Organization {
  name: string;
  email: string;
  address: Location;
  activity: string;
  fiscalNumber: string;
  bankAccount: BankAccount;
}

export interface Location {
  street: string;
  zipCode: string;
  city: string;
  country: string;
  phoneNumber?: string;
}

export interface BankAccount {
  address: Location;
  IBAN: string;
  BIC: string;
  bankName: string;
  holderName: string;
}

export interface Availabilities {
  yearFrom: string;
  monthFrom: string;
  dayFrom: string;
  yearTo: string;
  monthTo: string;
  dayTo: string;
}

export interface Dates {
  from: string;
  to: string;
}

export interface Movie {
  title: {
    international: string
  }
}
