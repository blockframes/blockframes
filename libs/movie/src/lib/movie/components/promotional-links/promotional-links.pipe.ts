import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { promotionalElementTypes } from '@blockframes/utils/static-model/static-model';

@Pipe({
  name: 'promotionalLinks',
  pure: true
})
export class PromotionalLinksPipe implements PipeTransform {

  async transform(links: string[], movie: Movie): Promise<any[]> {
    const _links = await Promise.all(links.map(async link => {
      const url = (movie.promotional[link] as string);

      if (!!url) {
        const linkLabel = promotionalElementTypes[link];
        const icon = 'play_arrow';
        const label = `Watch ${linkLabel}`;
        return { url, icon, label };
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
