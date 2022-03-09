import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Movie } from '@blockframes/model';
import {
  productionStatus,
  contentType,
  getISO3166TerritoryFromSlug,
  languages,
  genres as staticGenres,
} from '@blockframes/utils/static-model';
import { formatRunningTime } from '@blockframes/movie/pipes/running-time.pipe';

interface TitleFeature {
  view: string;
  tooltip: string;
}

function createTitleFeatureView(movie: Movie): TitleFeature[] {
  const { genres, runningTime, originalLanguages, originCountries } = movie;
  const isTv = movie.contentType === 'tv';
  const convertedGenres = genres.map((genre) => staticGenres[genre]);
  const convertedRunTime = isTv
    ? [formatRunningTime(runningTime), 'Per Episode']
    : formatRunningTime(runningTime);
  const convertedOriginalLanguages = originalLanguages.map((language) => languages[language]);
  const convertedOriginCountries = originCountries
    .map((country) => getISO3166TerritoryFromSlug(country))
    .map((country) => country.iso_a2);
  const statusLabel = productionStatus[movie.productionStatus];
  const season = movie.title.series > 0 ? `Season ${movie.title.series}` : '';
  const episodeCount = runningTime.episodeCount > 0 ? `${runningTime.episodeCount} episodes` : '';
  const features = [
    contentType[movie.contentType],
    convertedRunTime,
    convertedGenres,
    convertedOriginCountries,
    convertedOriginalLanguages,
    season,
    episodeCount,
    statusLabel,
  ];
  return features.map((feature) => {
    /* If feature is an array, take the first value for displaying it and the rest for the tooltip */
    if (Array.isArray(feature)) {
      return {
        view: feature[0],
        tooltip: feature.length > 1 ? feature.slice(1, features.length).join(', ') : '',
      };
    }
    return { view: feature, tooltip: '' };
  });
}

@Component({
  selector: '[movie] movie-title-features',
  templateUrl: './title-features.component.html',
  styleUrls: ['./title-features.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieTitleFeaturesComponent {
  public features: TitleFeature[];
  @Input() set movie(movie: Movie) {
    this.features = createTitleFeatureView(movie);
  }
}
