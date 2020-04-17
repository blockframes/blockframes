import { Pipe, PipeTransform } from '@angular/core';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { getLabelBySlug } from '../static-model/staticModels';

@Pipe({
  name: 'feature',
  pure: true
})
export class FeaturePipe implements PipeTransform {
  transform(value: Movie): string {
    const { workType, totalRunTime, genres, originalLanguages, productionYear } = value.main;
    return [
      workType ? workType[workType] : '',
      genres.length ? (getLabelBySlug('GENRES', genres[0]) + '...') : '',
      originalLanguages.length ? (getLabelBySlug('LANGUAGES', originalLanguages[0]) + '...') : '',
      productionYear,
      totalRunTime ? `${totalRunTime}'` : ''
    ].filter(v => !!v).join(' | ');
  }
}
