import { NgModule, ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { FormEntity } from 'ng-form-factory';
import { SliderSchema } from './slider.schema';
import { TextFormModule } from '../../forms/text';
import { FirestoreFormModule } from '../../forms/firestore';
import { FormChipsAutocompleteModule } from '../../forms/chips-autocomplete';
import { SelectFormModule } from '../../forms/select';
import { getTitlesQueryFn, toMap } from '../pipes';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { Movie, MovieService } from '@blockframes/movie/+state';

@Component({
  selector: 'form-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderComponent implements OnInit {
  private mode?: 'query' | 'titleIds';
  @Input() form?: FormEntity<SliderSchema>;


  app$ = this.route.paramMap.pipe(map( p => p.get('app')));
  titles$ = this.app$.pipe(
    map(app => getTitlesQueryFn(app)),
    switchMap(queryFn => this.service.valueChanges(queryFn)),
    map(toMap),
    shareReplay({ refCount: true, bufferSize: 1 }),
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

  private selectForm() {
    for (const key of ['titleIds', 'query'] as const) {
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
  declarations: [SliderComponent],
  exports: [SliderComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextFormModule,
    FormChipsAutocompleteModule,
    SelectFormModule,
    FirestoreFormModule,
    MatRadioModule
  ]
})
export class SliderModule { }
