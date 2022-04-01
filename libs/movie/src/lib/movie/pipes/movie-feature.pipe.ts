import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Movie } from '@blockframes/shared/model';
import { genres as staticGenres, languages, territoriesISOA2 } from '@blockframes/utils/static-model/static-model';
import { formatRunningTime } from '@blockframes/movie/pipes/running-time.pipe';

@Pipe({
  name: 'movieFeature',
  pure: true,
})
export class MovieFeaturePipe implements PipeTransform {
  transform(value: Movie): string {
    const { contentType, runningTime, genres, originalLanguages, originCountries, release } = value;

    let displayedGenres = '';
    if (genres.length > 0) displayedGenres += staticGenres[genres[0]];
    if (genres.length > 1) displayedGenres += ', ...';

    let displayedLanguages = '';
    if (originalLanguages.length > 0) displayedLanguages += languages[originalLanguages[0]];
    if (originalLanguages.length > 1) displayedLanguages += ', ...';

    let displayedCountries = '';
    if (originCountries.length > 0) displayedCountries += territoriesISOA2[originCountries[0]];
    if (originCountries.length > 1) displayedCountries += `, ${territoriesISOA2[originCountries[1]]}`;
    if (originCountries.length > 2) displayedCountries += ', ...';

    return [
      contentType ? contentType[contentType] : '',
      displayedGenres,
      displayedCountries,
      displayedLanguages,
      release.year,
      formatRunningTime(runningTime, false),
    ]
      .filter(v => !!v)
      .join(' | ');
  }
}

@NgModule({
  declarations: [MovieFeaturePipe],
  exports: [MovieFeaturePipe],
})
export class MovieFeatureModule {}
