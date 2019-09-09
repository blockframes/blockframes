import { randomString, randomEmail } from "./functions";

export interface User {
  email: string;
  password: string;
  name: string;
  surname: string;
}

export function createUser(): User {
  return {
    email: randomEmail(),
    password: randomString(),
    name: randomString(),
    surname: randomString()
  };
}
