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
  description: string;
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
  address: string;
  phoneNumber: string;
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
  return { address: randomString(), phoneNumber: randomString() };
}
