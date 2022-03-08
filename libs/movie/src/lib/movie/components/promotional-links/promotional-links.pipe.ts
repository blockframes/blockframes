import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { MediaService } from '@blockframes/media/+state/media.service';
import { Movie } from '@blockframes/model';
import { promotionalElementTypes } from '@blockframes/utils/static-model/static-model';

const documents = ['presentation_deck', 'scenario', 'moodboard'];

@Pipe({
  name: 'promotionalLinks',
  pure: true,
})
export class PromotionalLinksPipe implements PipeTransform {
  constructor(private mediaService: MediaService) {}

  async transform(links: string[], movie: Movie): Promise<any[]> {
    const _links = await Promise.all(
      links.map(async (link) => {
        if (movie.promotional[link].storagePath) {
          const url = await this.mediaService.generateImgIxUrl(movie.promotional[link]);
          if (url) {
            const linkLabel = promotionalElementTypes[link];
            const icon = documents.includes(link) ? 'document' : 'play_arrow';
            const label = `View ${linkLabel}`;
            return { url, icon, label };
          }
        }
      })
    );

    return _links.filter((l) => l);
  }
}

@NgModule({
  exports: [PromotionalLinksPipe],
  declarations: [PromotionalLinksPipe],
})
export class PromotionalLinksPipeModule {}
