import { randomString, randomEmail } from './functions';

export interface DeliveryInformation {
  minimumGuarantee: {
    amount: string;
    currency: string;
    deadlines: Deadline[];
  };
  dates: {
    dueDate: string;
    approvalPeriod: string;
    reworkingPeriod: string;
  };
  steps: Step[];
}

export interface Deadline {
  label: string;
  percentage: string;
  date: string;
}

export interface Step {
  name: string;
  date: string;
}
export interface Material {
  title: string;
  category: string;
  step: Step;
  description: string;
  price: string;
  currency: string;
}
export interface User {
  email: string;
  password: string;
  name: string;
  surname: string;
  phoneNumber?: string;
  position?: string;
}

export interface Organization {
  name: string;
  addresses: {
    main: {  
      street: string,
      zipCode: string,
      city: string,
      country: string,
      region?: string,
      phoneNumber: string
    }
  }
}

export function createUser(): User {
  return {
    email: randomEmail(),
    password: randomString(),
    name: randomString(),
    surname: randomString()
  };
}

export function createOrganization(): Organization {
  return { 
    name: randomString(),
    addresses: {
      main: {  
        street: randomString(),
        zipCode: randomString(),
        city: randomString(),
        country: randomString(),
        phoneNumber: randomString()
      }
    }
  };
}

export interface Material {
  title: string;
  category: string;
  description: string;
}
