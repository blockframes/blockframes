import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { genres as staticGenres, languages } from '@blockframes/utils/static-model/static-model';
import { formatRunningTime } from "@blockframes/movie/pipes/running-time.pipe";

@Pipe({
  name: 'movieFeature',
  pure: true
})
export class MovieFeaturePipe implements PipeTransform {
  transform(value: Movie): string {
    const { contentType, runningTime, genres, originalLanguages, release } = value;

    let displayedGenres = '';
    if (genres.length > 0) displayedGenres += staticGenres[genres[0]];
    if (genres.length > 1) displayedGenres += ', ...';

    let displayedLanguages = '';
    if (originalLanguages.length > 0) displayedLanguages += languages[originalLanguages[0]];
    if (originalLanguages.length > 1) displayedLanguages += ', ...';

    return [
      contentType ? contentType[contentType] : '',
      displayedGenres,
      displayedLanguages,
      release.year,
      formatRunningTime(runningTime)
    ].filter(v => !!v).join(' | ');
  }
}

@NgModule({
  declarations: [MovieFeaturePipe],
  exports: [MovieFeaturePipe]
})
export class MovieFeatureModule { }
