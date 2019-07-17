import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
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
  @Input() mode: string;
  @Input() set form(form: Movie | FormGroupLike) {
    this.movie = this.mode === 'preview' ? form : this.query.getActive();
  }

  public movie: Movie | FormGroupLike;

  constructor(
    private query: MovieQuery,
  ) { }

  ngOnInit() {
    // @todo not mandatory when used has childComponent but required when statefull
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
