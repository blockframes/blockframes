import { NgModule, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { FormEntity, FormGroupSchema } from 'ng-form-factory';

import { Organization, OrganizationService, orgName } from '@blockframes/organization/+state';
import { TextFormModule, matText } from '../../forms/text';
import { FormChipsAutocompleteModule } from '../../forms/chips-autocomplete';
import { matMultiSelect } from '../../forms/select';
import { Section } from '../../template/template.model';
import { getOrgsQueryFn, toMap } from '../pipes';
import { FirestoreFormModule, FirestoreQuery, firestoreQuery } from '../../forms/firestore';
import { map,shareReplay,switchMap } from 'rxjs/operators';

interface OrgsSection extends Section {
  title: string;
  orgIds: string[];
  query: FirestoreQuery;
}

export const orgsSchema: FormGroupSchema<OrgsSection> = {
  form: 'group',
  load: async () => import('./orgs.component').then(m => m.OrgsComponent),
  controls: {
    _type: { form: 'control' },
    title: matText({ label: 'title' }),
    orgIds: matMultiSelect<string>({ label: 'Org IDs' }),
    query: firestoreQuery({ collection: 'orgs' }),
  },
}

@Component({
  selector: 'form-orgs',
  templateUrl: './orgs.component.html',
  styleUrls: ['./orgs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgsComponent {
  private mode?: 'query' | 'orgIds';
  params$ = this.route.paramMap;
  @Input() form?: FormEntity<typeof orgsSchema>;
  
  orgs$ = this.params$.pipe(
    map(params => getOrgsQueryFn(params.get('app'))),
    switchMap(queryFn => this.service.valueChanges(queryFn)),
    map(toMap),
    shareReplay(1)
  );
    
  displayLabel = (org?: Organization) => orgName(org);
  getValue = (org?: Organization) => org?.id;

  constructor(
    private route: ActivatedRoute,
    private service: OrganizationService
  ) {}

  get queryMode() {
    return this.mode || (this.form?.get('orgIds').length ? 'orgIds' : 'query');
  }

  select(event: MatRadioChange) {
    this.mode = event.value;
    for (const key of ['orgIds', 'query'] as const) {
      event.value === key
        ? this.form?.get(key).enable()
        : this.form?.get(key).disable();
    }
  }
}




@NgModule({
  declarations: [OrgsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormChipsAutocompleteModule,
    TextFormModule,
    FirestoreFormModule,
    MatRadioModule,
  ]
})
export class OrgsModule { }
