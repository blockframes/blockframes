import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { default as staticModel } from '@blockframes/utils/static-model/staticModels';
import { startWith, map, filter, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormStaticArray } from '@blockframes/utils/form';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { GenresSlug } from '@blockframes/utils/static-model/types';

@Component({
  selector: 'movie-form-genre',
  templateUrl: './genres.component.html',
  styleUrls: ['./genres.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenreComponent implements OnInit {
  @Input() form: FormStaticArray<'GENRES'>;
  @Input() customGenreForm: FormList<string>;
  hasOtherGenre$: Observable<boolean>;
  genres$: Observable<any[]>;
  values$: Observable<GenresSlug[]>;

  ngOnInit() {
    this.values$ = this.form.valueChanges.pipe(
      startWith(this.form.value),
      shareReplay()
    );

    this.genres$ = this.values$.pipe(
      map(genres => staticModel.GENRES.filter(genre => !genres.includes(genre.slug)))
    )

    this.hasOtherGenre$ = this.values$.pipe(
      filter(_ => !!this.customGenreForm),
      map(genres => genres.includes('other'))
    );
  }

  add(genreSlug: GenresSlug) {
    this.form.setValue([...this.form.value, genreSlug]);
  }

  remove(genreSlug: GenresSlug) {
    const genres = this.form.value.filter(genre => genre !== genreSlug);
    this.form.setValue(genres);
  }
}
