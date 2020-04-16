import { Pipe, PipeTransform } from '@angular/core';
import { MovieMain } from '@blockframes/movie/+state/movie.model';
import { getLabelBySlug } from '../static-model/staticModels';

@Pipe({
  name: 'feature'
})
export class FeaturePipe implements PipeTransform {
  transform(value: MovieMain): string {
    const firstGenre = getLabelBySlug('GENRES', value.genres[0].trim().toLocaleLowerCase());
    const displayedGenre = value.genres.length > 1
      ? `${firstGenre} ...`
      : firstGenre;
    const productionYear = value.productionYear;
    const totalRunTime = typeof value.totalRunTime === 'string' ? value.totalRunTime : `${value.totalRunTime}'`;
    return `${displayedGenre} | ${productionYear} | ${totalRunTime}`
  }
}
