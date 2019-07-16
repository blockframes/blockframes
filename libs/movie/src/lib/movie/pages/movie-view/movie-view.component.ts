import { Component, OnInit, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MovieQuery, Movie } from '../../+state';
import { getLabelBySlug } from '../../staticModels';
import { FormGroupLike } from '@datorama/akita';

@Component({
  selector: 'movie-view',
  templateUrl: './movie-view.component.html',
  styleUrls: ['./movie-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieViewComponent implements OnInit, OnChanges {
  @Input() form: Movie | FormGroupLike;
  @Input() mode: string;

  public movie: Movie | FormGroupLike;

  constructor(
    private query: MovieQuery,
  ) { }

  ngOnInit() {
    if (this.mode === 'preview'){
      this.movie = this.form;
    } else {
      this.movie = this.query.getActive();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.form = changes.form.currentValue;

    if (this.mode === 'preview'){
      this.movie = this.form;
    } else {
      this.movie = this.query.getActive();
    }
  }

  /* Returns label from json staticModels */
  public getStaticBySlug (scope: string, slug: string) {
    return getLabelBySlug (scope, slug) as string;
  }

}
