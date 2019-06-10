import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieQuery, Movie } from '../../+state';
import { getLabelBySlug } from '../../staticModels';
import { FormGroupLike } from '@datorama/akita';

@Component({
  selector: 'movie-view',
  templateUrl: './movie-view.component.html',
  styleUrls: ['./movie-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieViewComponent implements OnInit {
  @Input() form$: Observable<FormGroupLike>;
  @Input() mode: string;

  movie$: Observable<Movie | FormGroupLike>;

  constructor(
    private query: MovieQuery,
  ) { }

  ngOnInit() {
    if (this.mode === 'preview'){
      this.movie$ = this.form$;
    } else {
      this.movie$ = this.query.selectActive();
    }
  }

  /* Returns label from json staticModels */
  public getStaticBySlug (scope: string, slug: string) {
    return getLabelBySlug (scope, slug) as string;
  }

}
