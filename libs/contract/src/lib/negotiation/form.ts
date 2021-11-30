import { FormControl, Validators, FormGroup } from "@angular/forms";
import { MovieLanguageSpecification } from "@blockframes/movie/+state/movie.firestore";
import { MovieVersionInfoForm } from "@blockframes/movie/form/movie.form";
import { EntityControl, FormEntity, FormList } from "@blockframes/utils/form";
import { AvailsForm } from "../avails/form/avails.form";
import { BucketTerm } from "../term/+state";
import { Negotiation } from "./+state/negotiation.firestore";

type NegotiationFormState = {
  price: number,
  terms: {
    avails: BucketTerm<Date>,
    id: string,
    versions: Record<string, MovieLanguageSpecification>
  }[]
}

export class NegotiationForm extends FormEntity<EntityControl<NegotiationFormState>, Negotiation|NegotiationFormState> {
  constructor(initialData?: Negotiation) {
    super({
      price: new FormControl(initialData?.price || 0, Validators.min(0)),
      terms: FormList.factory(initialData?.terms || [], (term: BucketTerm) => new FormGroup({
        id: new FormControl(),
        avails: new AvailsForm(term, []),
        versions: new MovieVersionInfoForm(term.languages)
      }))
    })
  }
}
