import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MediaService } from '@blockframes/media/+state/media.service';
import { promotionalElementTypes } from '@blockframes/utils/static-model/static-model';
import { StorageFile } from '@blockframes/media/+state/media.firestore';

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
      const ref = (movie.promotional[link] as StorageFile | string);
      const useImgIx = ['scenario', 'presentation_deck', 'moodboard'].includes(link);

      if (!useImgIx && typeof ref !== 'string') {
        throw new Error('Referene should be of type string')
      }

      if (!!ref) {
        const url = useImgIx ? await this.mediaService.generateImgIxUrl(ref as StorageFile) : ref as string;
        if (!!url) {
          const linkLabel = promotionalElementTypes[link];
          const icon = useImgIx ? 'cloud_download' : 'play_arrow';
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
