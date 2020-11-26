import { NgModule, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatFormFieldModule } from '@angular/material/form-field';

import { Movie } from '@blockframes/movie/+state';
import { FormEntity, FormGroupSchema } from 'ng-form-factory';
import { Section } from '../../template/template.model';
import { TextFormModule, matText } from '../../forms/text';
import { FormChipsAutocompleteModule } from '../../forms/chips-autocomplete';
import { SelectFormModule, matMultiSelect, matSelect } from '../../forms/select';
import { FirestoreFormModule, firestoreQuery, FirestoreQuery } from '../../forms/firestore';
import { HomePipesModule } from '../pipes';

interface TitlesSection extends Section {
  _type: 'titles',
  title: string;
  mode: 'poster' | 'banner' | 'slider';
  titleIds: string[];
  query: FirestoreQuery;
}

type TitlesSchema = FormGroupSchema<TitlesSection>;

export const titlesSchema: TitlesSchema = {
  form: 'group',
  load: async () => import('./titles.component').then(m => m.TitlesComponent),
  controls: {
    _type: { form: 'control' },
    title: matText({ label: 'title' }),
    mode: matSelect({ label: 'Mode', options: ['poster', 'banner', 'slider'] }),
    titleIds: matMultiSelect<string>({ label: 'Titles ID' }),
    query: firestoreQuery({ collection: 'movies' }),
  },
}

@Component({
  selector: 'form-titles',
  templateUrl: './titles.component.html',
  styleUrls: ['./titles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitlesComponent {
  @Input() form?: FormEntity<TitlesSchema>;
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
    SelectFormModule,
    FormChipsAutocompleteModule,
    TextFormModule,
    HomePipesModule,
    FirestoreFormModule,
  ]
})
export class TitlesModule { }
