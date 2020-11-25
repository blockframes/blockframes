import { NgModule, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { FormEntity, FormGroupSchema } from 'ng-form-factory';
import { Movie, MovieService } from '@blockframes/movie/+state';
import { Section } from '../../template/template.model';
import { TextFormModule, matText } from '../../forms/text';
import { FormAutocompleteModule } from '../../forms/autocomplete';

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
    titleIds: { form: 'array', controls: [], factory: { form: 'control' }},
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
  options$ = this.movieService.valueChanges();
  displayLabel = (title?: Movie) => title?.title.international; 
  constructor(private movieService: MovieService) {}
}


@NgModule({
  declarations: [TitlesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OverlayModule,
    MatFormFieldModule,
    MatSelectModule,
    FormAutocompleteModule,
    TextFormModule,
  ]
})
export class TitlesModule { }
