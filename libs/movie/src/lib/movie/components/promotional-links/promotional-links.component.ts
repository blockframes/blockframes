import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Movie } from '@blockframes/movie/+state';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';

const promoLinks = [
  'promo_reel_link',
  'scenario',
  'screener_link',
  'teaser_link',
  'presentation_deck',
  'trailer_link'
];

@Component({
  selector: '[movie] movie-promotional-links',
  templateUrl: './promotional-links.component.html',
  styleUrls: ['./promotional-links.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionalLinksComponent {
  public promoLinks = promoLinks;

  @Input() movie: Movie;

  get hasLink(): boolean {
    return this.promoLinks.some(link => !!this.movie.promotionalElements[link].media.url);
  }

  get links() {
    return promoLinks.map(link => {
      if (this.movie.promotionalElements[link].media.url) {
        const isDownload = link === 'scenario' || link === 'presentation_deck';
        return {
          url: this.movie.promotionalElements[link].media.url,
          icon: isDownload ? 'download' : 'play',
          label: isDownload
            ? `Download ${getLabelBySlug('PROMOTIONAL_ELEMENT_TYPES', link)}`
            : `Watch ${getLabelBySlug('PROMOTIONAL_ELEMENT_TYPES', link)}`
        };
      }
    }).filter(link => link);
  }
}
