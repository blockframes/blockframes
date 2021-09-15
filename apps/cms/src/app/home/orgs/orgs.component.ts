import { NgModule, ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { FormEntity, FormGroupSchema } from 'ng-form-factory';

import { Organization, OrganizationService, orgName } from '@blockframes/organization/+state';
import { OrgsSection, TemplateParams } from '@blockframes/admin/cms';
import { TextFormModule, matText } from '../../forms/text';
import { FormChipsAutocompleteModule } from '../../forms/chips-autocomplete';
import { matMultiSelect } from '../../forms/select';
import { getOrgsQueryFn, toMap } from '../pipes';
import { FirestoreFormModule, firestoreQuery, orgsFromApp } from '../../forms/firestore';
import { map,shareReplay,switchMap } from 'rxjs/operators';


type OrgsSchema = FormGroupSchema<OrgsSection>;


export const orgsSchema = (params: TemplateParams): OrgsSchema => ({
  form: 'group',
  load: async () => import('./orgs.component').then(m => m.OrgsComponent),
  controls: {
    _type: { form: 'control' },
    title: matText({ label: 'title' }),
    link: matText({ label: 'See all Link', placeholder: '../organization' }),
    orgIds: matMultiSelect<string>({ label: 'Org IDs' }),
    query: firestoreQuery({ collection: 'orgs' }),
  },
  value: (value: OrgsSection) => ({
    _type: 'orgs',
    query: orgsFromApp(params.app),
    ...value
  })
});

@Component({
  selector: 'form-orgs',
  templateUrl: './orgs.component.html',
  styleUrls: ['./orgs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgsComponent implements OnInit {
  private mode?: 'query' | 'orgIds';
  params$ = this.route.paramMap;
  @Input() form?: FormEntity<OrgsSchema>;

  orgs$ = this.params$.pipe(
    map(params => getOrgsQueryFn(params.get('app'))),
    switchMap(queryFn => this.service.valueChanges(queryFn)),
    map(toMap),
    shareReplay({ refCount: true, bufferSize: 1 }),
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

  private selectForm() {
    for (const key of ['orgIds', 'query'] as const) {
      this.queryMode === key
        ? this.form?.get(key).enable()
        : this.form?.get(key).disable();
    }
  }

  ngOnInit() {
    this.selectForm();
  }

  select(event: MatRadioChange) {
    this.mode = event.value;
    this.selectForm();
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
