import { FormControl, Validators, FormGroup } from "@angular/forms";
import { MovieVersionInfoForm } from "@blockframes/movie/form/movie.form";
import { EntityControl, FormEntity, FormList } from "@blockframes/utils/form";
import { AvailsForm } from "../avails/form/avails.form";
import { Term } from "../term/+state";

export type Negotiation = {
  price: number,
  terms: Term[]
}

export class NegotitationForm extends FormEntity<EntityControl<Negotiation>, Negotiation> {
  constructor(initialData?: Negotiation) {
    super({
      price: new FormControl(initialData?.price || 0, Validators.min(0)),
      terms: FormList.factory(initialData?.terms || [], (term: Term) => new FormGroup({
        id: new FormControl(term.id),
        avails: new AvailsForm(term, []),
        versions: new MovieVersionInfoForm(term.languages)
      }))
    })
  }
}
