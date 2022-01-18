
import { Term } from "./term.firestore";
export { Term, Duration, BucketTerm } from "./term.firestore";

export function createTerm(params: Partial<Term<Date>> = {}): Term<Date> {
  return {
    id: '',
    contractId: '',
    territories: [],
    medias: [],
    exclusive: false,
    duration: { from: new Date(), to: new Date() },
    licensedOriginal: null,
    languages: {},
    criteria: [],
    ...params
  }
}
