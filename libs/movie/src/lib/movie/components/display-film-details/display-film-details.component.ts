import { AFM_DISABLE } from '@env';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { hasSlug } from '@blockframes/utils/static-model/staticModels';

@Component({
  selector: 'movie-display-film-details',
  templateUrl: './display-film-details.component.html',
  styleUrls: ['./display-film-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayFilmDetailsComponent {
  @Input() main;
  @Input() salesInfo;
  @Input() color;
  @Input() movieSalesInfo;
  // TODO issue#1146
  public AFM_DISABLE = AFM_DISABLE;

  public hasTheatricalRelease() {
    return hasSlug(this.salesInfo.originalRelease.map(r => r.media), 'MEDIAS', 'theatrical');
  }
}
