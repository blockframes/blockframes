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
      const url = (movie.promotional[link] as string);
      if (!!url) {
        const shouldDownload = ['scenario', 'presentation_deck'].includes(link);
        const linkLabel = getLabelBySlug('PROMOTIONAL_ELEMENT_TYPES', link);
        const icon = shouldDownload ? 'download' : 'play';
        const label = shouldDownload ? `Download ${linkLabel}` : `Watch ${linkLabel}`;
        return { url, icon, label };
      }
    }).filter(link => link);
  }
}

@NgModule({
  exports: [PromotionalLinksPipe],
  declarations: [PromotionalLinksPipe],
})
export class PromotionalLinksPipeModule { }
