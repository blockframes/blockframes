import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Movie } from '../../+state';
import { getLabelBySlug } from '../../staticModels';

@Component({
  selector: '[movie] movie-display-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayComponent {

  @Input() movie: Movie;

  constructor() { }

  /* Returns label from json staticModels */ //@todo remove #643
  public getStaticBySlug(scope: string, slug: string) {
    return getLabelBySlug (scope, slug) as string;
  }

}
