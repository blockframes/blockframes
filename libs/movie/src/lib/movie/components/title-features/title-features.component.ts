import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Movie } from '@blockframes/movie/+state';
import { productionStatus, contentType, getISO3166TerritoryFromSlug, languages, territoriesISOA2 } from '@blockframes/utils/static-model';
import { formatRunningTime } from "@blockframes/movie/pipes/running-time.pipe";

interface TitleFeature {
  view: string,
  tooltip: string
}

function createTitleFeatureView(movie: Movie): TitleFeature[] {
  const { genres, runningTime, originalLanguages, originCountries, stakeholders } = movie;
  const convertedGenres = genres.map(genre => genres[genre]);
  const convertedRunTime = formatRunningTime(runningTime);
  const convertedOriginalLanguages = originalLanguages.map(language => languages[language]);
  const convertedOriginCountries = originCountries.map(country => getISO3166TerritoryFromSlug(country)).map(country => country.iso_a2);
  const statusLabel = productionStatus[movie.productionStatus];
  const productionCountries = [];
  for (const company of stakeholders.productionCompany) {
    for (const country of company.countries) {
      if (!productionCountries.includes(territoriesISOA2[country])) productionCountries.push(territoriesISOA2[country]);
    }
  }
  const features = [
    contentType[movie.contentType],
    convertedRunTime,
    convertedGenres,
    productionCountries,
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
