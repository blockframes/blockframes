import { NgModule, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';

import { Movie, MovieService } from '@blockframes/movie/+state';
import { FormEntity, FormGroupSchema } from 'ng-form-factory';
import { Section, TemplateParams } from '../../template/template.model';
import { TextFormModule, matText } from '../../forms/text';
import { FormChipsAutocompleteModule } from '../../forms/chips-autocomplete';
import { SelectFormModule, matMultiSelect, matSelect } from '../../forms/select';
import { FirestoreFormModule, firestoreQuery, FirestoreQuery, titlesFromApp } from '../../forms/firestore';
import { getTitlesQueryFn, toMap } from '../pipes';
import { map, shareReplay, switchMap } from 'rxjs/operators';

interface TitlesSection extends Section {
  _type: 'titles',
  title: string;
  mode: string; // 'poster' | 'banner' | 'slider';
  titleIds: string[];
  query: FirestoreQuery;
}

type TitlesSchema = FormGroupSchema<TitlesSection>;

export const titlesSchema = (params: TemplateParams): TitlesSchema => ({
  form: 'group',
  load: async () => import('./titles.component').then(m => m.TitlesComponent),
  controls: {
    _type: { form: 'control' },
    title: matText({ label: 'title' }),
    mode: matSelect({ label: 'Mode', options: ['poster', 'banner', 'slider'] }),
    titleIds: matMultiSelect<string>({ label: 'Titles ID' }),
    query: firestoreQuery({ collection: 'movies', value: titlesFromApp(params.app) }),
  },
  value: (value: TitlesSection) => ({
    _type: 'titles',
    query: titlesFromApp(params.app),
    ...value
  })
})

@Component({
  selector: 'form-titles',
  templateUrl: './titles.component.html',
  styleUrls: ['./titles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitlesComponent {
  private mode?: 'query' | 'titleIds';
  @Input() form?: FormEntity<TitlesSchema>;
  
  
  app$ = this.route.paramMap.pipe(map( p => p.get('app')));
  titles$ = this.app$.pipe(
    map(app => getTitlesQueryFn(app)),
    switchMap(queryFn => this.service.valueChanges(queryFn)),
    map(toMap),
    shareReplay(1)
  );

  displayLabel = (title?: Movie) => title?.title.international;
  getValue = (title?: Movie) => title?.id;

  constructor(
    private route: ActivatedRoute,
    private service: MovieService,
  ) {}

  get queryMode() {
    return this.mode || (this.form?.get('titleIds').length ? 'titleIds' : 'query');
  }

  select(event: MatRadioChange) {
    this.mode = event.value;
    for (const key of ['titleIds', 'query'] as const) {
      event.value === key
        ? this.form?.get(key).enable()
        : this.form?.get(key).disable();
    }
  }
}


@NgModule({
  declarations: [TitlesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OverlayModule,
    MatFormFieldModule,
    MatRadioModule,
    SelectFormModule,
    FormChipsAutocompleteModule,
    TextFormModule,
    FirestoreFormModule,
  ]
})
export class TitlesModule { }
