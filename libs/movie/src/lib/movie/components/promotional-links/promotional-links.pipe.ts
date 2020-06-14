import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';

@Pipe({
  name: 'promotionalLinks',
  pure: true
})
export class PromotionalLinksPipe implements PipeTransform {
  transform(links: string[], movie: Movie) {
    return links.map(link => {
      if (movie.promotionalElements[link].media.urls.original) {
        const isDownload = link === 'scenario' || link === 'presentation_deck';
        return {
          url: movie.promotionalElements[link].media.urls.original,
          icon: isDownload ? 'download' : 'play',
          label: isDownload
            ? `Download ${getLabelBySlug('PROMOTIONAL_ELEMENT_TYPES', link)}`
            : `Watch ${getLabelBySlug('PROMOTIONAL_ELEMENT_TYPES', link)}`
        };
      }
    }).filter(link => link);
  }
}

@NgModule({
  exports: [PromotionalLinksPipe],
  declarations: [PromotionalLinksPipe],
})
export class PromotionalLinksPipeModule { }
