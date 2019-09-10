import { randomEmail, randomString } from "./helper";

export interface User {
  email: string,
  pw: string,
  firstName: string,
  lastName: string
}

export function createRandomUser(): User {
  return {
    email: randomEmail(),
    pw: randomString(),
    firstName: randomString(),
    lastName: randomString()
  }
}
