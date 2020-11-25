import { NgModule, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormEntity, FormGroupSchema } from 'ng-form-factory';
import { Section } from '../../template/template.model';
import { FormAutocompleteModule, matSelect } from '../../forms/autocomplete';
import { FormChipsAutocompleteModule, matMuliSelect } from '../../forms/chips-autocomplete';
import { TextFormModule, matText } from '../../forms/text';
import { Organization, orgName } from '@blockframes/organization/+state';
import { Movie } from '@blockframes/movie/+state';
import { HomePipesModule } from '../pipes';

interface OrgTitle extends Section {
  title: string;
  description: string;
  orgId: string;
  movieIds: string[];
}

export const orgTitleSchema: FormGroupSchema<OrgTitle> = {
  form: 'group',
  load: async () => import('./org-titles.component').then(m => m.OrgsComponent),
  controls: {
    _type: { form: 'control' },
    title: matText({ label: 'title' }),
    description: matText({ label: 'description' }),
    orgId: matSelect({ label: 'Org ID' }),
    movieIds: matMuliSelect({ label: 'Title IDS' })
  },
}

type OrgTitleForm = FormEntity<typeof orgTitleSchema>;


@Component({
  selector: 'form-org-titles',
  templateUrl: './org-titles.component.html',
  styleUrls: ['./org-titles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgsComponent {
  @Input() form: OrgTitleForm;

  params$ = this.route.paramMap;
  
  displayOrgLabel = (org?: Organization) => orgName(org); 
  getOrgValue = (org?: Organization) => org?.id; 
  displayTitleLabel = (title?: Movie) => title?.title.international;
  getTitleValue = (title?: Movie) => title?.id;

  constructor(private route: ActivatedRoute) {}

  reset() {
    this.form.get('movieIds').clear();
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
  ]
})
export class OrgsModule { }
