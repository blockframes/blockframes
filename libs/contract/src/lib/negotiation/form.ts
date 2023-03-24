import { UntypedFormControl, Validators } from '@angular/forms';
import { EntityControl, FormEntity, FormList } from '@blockframes/utils/form';
import { BucketTermForm, createBucketTermControl } from '../bucket/form';
import { BucketTerm, Term, Negotiation } from '@blockframes/model';

type NegotiationFormState = {
  price: number,
  terms: BucketTerm[]
}

// We want the NegotiationFrom to manage Term & BucketTerm
const createControl = (term: Partial<BucketTerm | Term> = {}) => {
  return ('id' in term)
    ? { ...createBucketTermControl(term), id: new UntypedFormControl(term.id) }
    : createBucketTermControl(term);
}

export class NegotiationForm extends FormEntity<EntityControl<NegotiationFormState>,  NegotiationFormState> {
  constructor(negotiation: Partial<Negotiation> = {}) {
    const nego = { price: 0, terms: [], ...negotiation };
    super({
      price: new UntypedFormControl(nego.price, Validators.min(0)),
      terms: FormList.factory(nego.terms, term => BucketTermForm.factory(term, createControl))
    })
  }
}
