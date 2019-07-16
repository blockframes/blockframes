import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Movie } from '../../+state';
import { getLabelBySlug } from '../../staticModels';
import { FormGroupLike } from '@datorama/akita';

@Component({
  selector: 'movie-display',
  templateUrl: './movie-display.component.html',
  styleUrls: ['./movie-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayComponent {
  @Input() movie: Movie | FormGroupLike;

  constructor() { }

  /* Returns label from json staticModels */
  public getStaticBySlug (scope: string, slug: string) {
    return getLabelBySlug (scope, slug) as string;
  }

}
