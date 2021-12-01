import { FormControl, Validators } from "@angular/forms";
import { EntityControl, FormEntity, FormList } from "@blockframes/utils/form";
import { BucketTermForm, createBucketTermControl } from "../bucket/form";
import { BucketTerm } from "../term/+state";
import { Negotiation } from "./+state/negotiation.firestore";

export type NegotiationFormState = {
  price: number,
  terms: BucketTerm<Date>[]
}

export class NegotiationForm extends FormEntity<EntityControl<NegotiationFormState>, Negotiation | NegotiationFormState> {
  constructor(negotiation: Partial<Negotiation> = {}) {
    super({
      price: new FormControl(negotiation?.price || 0, Validators.min(0)),
      terms: FormList.factory(negotiation.terms, term => BucketTermForm.factory(term, createBucketTermControl))
    })
  }
}
