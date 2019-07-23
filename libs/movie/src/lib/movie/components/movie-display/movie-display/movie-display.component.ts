import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Movie } from '../../../+state';
import { getLabelBySlug } from '../../../staticModels';

@Component({
  selector: 'movie-display',
  templateUrl: './movie-display.component.html',
  styleUrls: ['./movie-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayComponent {
  public movie : Movie;
  
  @Input() set data(data: Movie) {
    this.movie = data;
  }

  constructor() { }

  /* Returns label from json staticModels */
  public getStaticBySlug (scope: string, slug: string) {
    return getLabelBySlug (scope, slug) as string;
  }

}
