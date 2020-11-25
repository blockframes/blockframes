import { NgModule, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { Movie } from '@blockframes/movie/+state';
import { FormEntity, FormGroupSchema } from 'ng-form-factory';
import { Section } from '../../template/template.model';
import { TextFormModule, matText } from '../../forms/text';
import { FormChipsAutocompleteModule, matMuliSelect } from '../../forms/chips-autocomplete';
import { HomePipesModule } from '../pipes';

interface TitleQueryParams {
  facets: string[];
}

interface TitlesSection extends Section {
  title: string;
  query: TitleQueryParams;
  titleIds: string[];
  mode: 'poster' | 'banner' | 'slider';
}

export const titlesSchema: FormGroupSchema<TitlesSection> = {
  form: 'group',
  load: async () => import('./titles.component').then(m => m.TitlesComponent),
  controls: {
    _type: { form: 'control' },
    title: matText({ label: 'title' }),
    titleIds: matMuliSelect<string>({ label: 'Titles ID' }),
    query: { form: 'group', controls: {} },
    mode: { form: 'control' },
  },
}


@Component({
  selector: 'form-titles',
  templateUrl: './titles.component.html',
  styleUrls: ['./titles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitlesComponent {
  @Input() form?: FormEntity<typeof titlesSchema>;
  displayLabel = (title?: Movie) => title?.title.international;
  getValue = (title?: Movie) => title?.id;

  params$ = this.route.paramMap;

  constructor(private route: ActivatedRoute) {}
}


@NgModule({
  declarations: [TitlesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OverlayModule,
    MatFormFieldModule,
    MatSelectModule,
    FormChipsAutocompleteModule,
    TextFormModule,
    HomePipesModule
  ]
})
export class TitlesModule { }
