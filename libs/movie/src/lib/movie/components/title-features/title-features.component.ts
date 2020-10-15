import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Movie } from '@blockframes/movie/+state';
import { getISO3166TerritoryFromSlug, languages } from '@blockframes/utils/static-model/staticConsts';
import { staticConsts } from '@blockframes/utils/static-model';

interface TitleFeature {
  view: string,
  tooltip: string
}

function createTitleFeatureView(movie: Movie): TitleFeature[] {
  const { genres, runningTime, originalLanguages, originCountries } = movie;
  const convertedGenres = genres.map(genre => genres[genre]);
  const convertedRunTime = typeof runningTime.time === "string" ? runningTime.time : `${runningTime.time}min`;
  const convertedOriginalLanguages = originalLanguages.map(language => languages[language]);
  const convertedOriginCountries = originCountries.map(country => getISO3166TerritoryFromSlug(country)).map(country => country.iso_a2);
  const statusLabel = staticConsts.productionStatus[movie.productionStatus];
  const features = [
    staticConsts.contentType[movie.contentType],
    convertedRunTime,
    convertedGenres,
    convertedOriginalLanguages,
    convertedOriginCountries,
    statusLabel
  ]
  return features.map(feature => {
    /* If array, show the first value and the tooltip gets the string version of it */
    if (Array.isArray(feature)) {
      return { view: feature[0], tooltip: feature.length > 1 ? feature.join(', ') : '' }
    }
    return { view: feature, tooltip: '' }
  })
}

@Component({
  selector: '[movie] movie-title-features',
  templateUrl: './title-features.component.html',
  styleUrls: ['./title-features.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieTitleFeaturesComponent {
  public features: TitleFeature[];
  @Input() set movie(movie: Movie) {
    this.features = createTitleFeatureView(movie);
  };
}
