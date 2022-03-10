import { NgModule, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormEntity, FormGroupSchema } from 'ng-form-factory';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { Organization, orgName, Movie} from '@blockframes/model';
import { OrgTitlesSection } from '@blockframes/admin/cms';
import { FormAutocompleteModule } from '../../forms/autocomplete';
import { FormChipsAutocompleteModule } from '../../forms/chips-autocomplete';
import { TextFormModule, matText } from '../../forms/text';
import { matMultiSelect, matSelect } from '../../forms/select';
import {
  FirestoreFormModule,
  firestoreQuery,
  titlesFromOrg,
  titlesFromApp,
  limit,
} from '../../forms/firestore';
import { HomePipesModule } from '../pipes';
import { App } from '@blockframes/utils/apps';

export const orgTitleSchema: FormGroupSchema<OrgTitlesSection> = {
  form: 'group',
  load: async () => import('./org-titles.component').then((m) => m.OrgsComponent),
  controls: {
    _type: { form: 'control' },
    title: matText({ label: 'title' }),
    description: matText({ label: 'description', size: 'long' }),
    orgId: matSelect({ label: 'Org ID' }),
    titleIds: matMultiSelect({ label: 'Title IDS' }),
    query: firestoreQuery({ collection: 'movies' }),
  },
};

type OrgTitleForm = FormEntity<typeof orgTitleSchema>;

@Component({
  selector: 'form-org-titles',
  templateUrl: './org-titles.component.html',
  styleUrls: ['./org-titles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgsComponent {
  private mode?: 'query' | 'titleIds';

  @Input() form: OrgTitleForm;

  params$ = this.route.paramMap;

  displayOrgLabel = (org?: Organization) => orgName(org);
  getOrgValue = (org?: Organization) => org?.id;
  displayTitleLabel = (title?: Movie) => title?.title.international;
  getTitleValue = (title?: Movie) => title?.id;

  constructor(private route: ActivatedRoute) {}

  get queryMode() {
    return this.mode || (this.form?.get('titleIds').length ? 'titleIds' : 'query');
  }

  reset(orgId: string) {
    if (typeof orgId === 'string') {
      this.form.get('titleIds').clear();
      this.form.get('query').clear();
      const app = this.route.snapshot.paramMap.get('app') as App;
      this.form.get('query').add([...titlesFromApp(app), ...titlesFromOrg(orgId), limit(4)]);
    }
  }

  select(event: MatRadioChange) {
    this.mode = event.value;
    for (const key of ['titleIds', 'query'] as const) {
      event.value === key ? this.form?.get(key).enable() : this.form?.get(key).disable();
    }
  }
}

@NgModule({
  declarations: [OrgsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormAutocompleteModule,
    FormChipsAutocompleteModule,
    TextFormModule,
    HomePipesModule,
    MatRadioModule,
    FirestoreFormModule,
  ],
})
export class OrgsModule {}
