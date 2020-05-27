import { Pipe, PipeTransform } from '@angular/core';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';

@Pipe({
  name: 'movieFeature',
  pure: true
})
export class MovieFeaturePipe implements PipeTransform {
  transform(value: Movie): string {
    const { workType, totalRunTime, genres, originalLanguages, productionYear } = value.main;

    let displayedGenres = '';
    if (genres.length > 0) displayedGenres += getLabelBySlug('GENRES', genres[0]);
    if (genres.length > 1) displayedGenres += ', ...';

    let displayedLanguages = '';
    if (originalLanguages.length > 0) displayedLanguages += getLabelBySlug('LANGUAGES', originalLanguages[0]);
    if (originalLanguages.length > 1) displayedLanguages += ', ...';

    return [
      workType ? workType[workType] : '',
      displayedGenres,
      displayedLanguages,
      productionYear,
      totalRunTime ? `${totalRunTime}'` : ''
    ].filter(v => !!v).join(' | ');
  }
}
