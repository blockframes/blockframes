import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { MediaService } from '@blockframes/media/+state/media.service';

@Pipe({
  name: 'promotionalLinks',
  pure: true
})
export class PromotionalLinksPipe implements PipeTransform {

  constructor(
    private mediaService: MediaService,
  ) { }

  async transform(links: string[], movie: Movie): Promise<any[]> {
    const _links = await Promise.all(links.map(async link => {
      const ref = (movie.promotional[link] as string);
      const useImgIx = ['scenario', 'presentation_deck'].includes(link);
      if (!!ref) {
        const url = useImgIx ? await this.mediaService.generateImgIxUrl(ref) : ref;
        if (!!url) {
          const linkLabel = getLabelBySlug('PROMOTIONAL_ELEMENT_TYPES', link);
          const icon = useImgIx ? 'download' : 'play';
          const label = useImgIx ? `Download ${linkLabel}` : `Watch ${linkLabel}`;
          return { url, icon, label };
        }
      }
    }));

    return _links.filter(l => l);
  }
}

@NgModule({
  exports: [PromotionalLinksPipe],
  declarations: [PromotionalLinksPipe],
})
export class PromotionalLinksPipeModule { }
