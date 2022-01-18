
import { Term } from "./term.firestore";
export { Term, Duration, BucketTerm } from "./term.firestore";
import { hydrateLanguageForEmail } from "@blockframes/contract/negotiation/utils";
import { BucketTerm } from "@blockframes/contract/term/+state";
import { Timestamp } from "@blockframes/utils/common-interfaces/timestamp";
import { staticModel } from "@blockframes/utils/static-model";
import { format } from "date-fns";

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


export function createMailTerm(terms:BucketTerm<Timestamp>[]){
  return terms.map(term => ({
    ...term,
    territories: term.territories.map(territory => staticModel['territories'][territory]).join(', '),
    medias: term.medias.map(media => staticModel['medias'][media] ?? media).join(', '),
    duration: {
      from: format(term.duration.from.toDate(), 'dd MMMM, yyyy'),
      to: format(term.duration.to.toDate(), 'dd MMMM, yyyy'),
    },
    languages: hydrateLanguageForEmail(term.languages),
  }))
}

export type MailTerm = ReturnType< typeof createMailTerm>[number]

