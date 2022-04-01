import { NgModule, ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';

import { FormEntity, FormGroupSchema } from 'ng-form-factory';
import { Movie } from '@blockframes/shared/model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { TitlesSection, TemplateParams } from '@blockframes/admin/cms';
import { TextFormModule, matText } from '../../forms/text';
import { FormChipsAutocompleteModule } from '../../forms/chips-autocomplete';
import { SelectFormModule, matMultiSelect, matSelect } from '../../forms/select';
import { FirestoreFormModule, firestoreQuery, titlesFromApp } from '../../forms/firestore';
import { getTitlesQueryFn, toMap } from '../pipes';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { sortingOptions } from '@blockframes/utils/pipes/sort-array.pipe';

export type TitlesSchema = FormGroupSchema<TitlesSection>;

export const titlesSchema = (params: TemplateParams): TitlesSchema => ({
  form: 'group',
  load: async () => import('./titles.component').then(m => m.TitlesComponent),
  controls: {
    _type: { form: 'control' },
    title: matText({ label: 'Title' }),
    link: matText({ label: 'See all Link', placeholder: '../title' }),
    mode: matSelect({ label: 'Mode', options: ['poster', 'banner'], value: 'banner' }),
    sorting: matSelect({ label: 'Sorting', options: sortingOptions, value: 'default' }),
    titleIds: matMultiSelect<string>({ label: 'Titles ID' }),
    query: firestoreQuery({ collection: 'movies' }),
  },
  value: (value: TitlesSection) => ({
    _type: 'titles',
    query: titlesFromApp(params.app),
    ...value,
  }),
});

@Component({
  selector: 'form-titles',
  templateUrl: './titles.component.html',
  styleUrls: ['./titles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitlesComponent implements OnInit {
  private mode?: 'query' | 'titleIds';
  @Input() form?: FormEntity<TitlesSchema>;

  app$ = this.route.paramMap.pipe(map(p => p.get('app')));
  titles$ = this.app$.pipe(
    map(app => getTitlesQueryFn(app)),
    switchMap(queryFn => this.service.valueChanges(queryFn)),
    map(toMap),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  displayLabel = (title?: Movie) => title?.title.international;
  getValue = (title?: Movie) => title?.id;

  constructor(private route: ActivatedRoute, private service: MovieService) {}

  get queryMode() {
    return this.mode || (this.form?.get('titleIds').length ? 'titleIds' : 'query');
  }

  private selectForm() {
    for (const key of ['titleIds', 'query'] as const) {
      this.queryMode === key ? this.form?.get(key).enable() : this.form?.get(key).disable();
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
  ],
})
export class TitlesModule {}
