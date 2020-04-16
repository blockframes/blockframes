import { Pipe, PipeTransform } from '@angular/core';
import { MovieMain } from '@blockframes/movie/+state/movie.model';
import { getLabelBySlug } from '../static-model/staticModels';

@Pipe({
  name: 'feature'
})
export class FeaturePipe implements PipeTransform {
  transform(value: MovieMain): string {
    const genres = value.genres.map(genre =>
      getLabelBySlug('GENRES', genre.trim().toLocaleLowerCase())).join(', ');
    const productionYear = value.productionYear;
    const totalRunTime = typeof value.totalRunTime === 'string' ? value.totalRunTime : `${value.totalRunTime}'`;
    return `${genres} | ${productionYear} | ${totalRunTime}`
  }
}
