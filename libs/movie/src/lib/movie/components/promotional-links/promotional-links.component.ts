import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Movie } from '@blockframes/movie/+state';

@Component({
  selector: '[movie] movie-promotional-links',
  templateUrl: './promotional-links.component.html',
  styleUrls: ['./promotional-links.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionalLinksComponent {

  @Input() movie: Movie;
  @Input() links: string[];

  get hasLink(): boolean {
    return this.links.some(link => !!this.movie.promotionalElements[link].media.url);
  }
}
