import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Movie } from '@blockframes/movie/+state';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { getISO3166TerritoryFromSlug } from '@blockframes/utils/static-model/territories-ISO-3166';
import { contentType } from '@blockframes/movie/+state/movie.firestore';

interface TitleFeature {
    view: string,
    tooltip: string
}

function createTitleFeatureView(movie: Movie): TitleFeature[] {
    const { genres, totalRunTime, originalLanguages, originCountries, status } = movie.main;
    const convertedGenres = genres.map(genre => getLabelBySlug('GENRES', genre));
    const convertedRunTime = typeof totalRunTime === "string" ? totalRunTime : `${totalRunTime}min`;
    const convertedOriginalLanguages = originalLanguages.map(language => getLabelBySlug('LANGUAGES', language));
    const convertedOriginCountries = originCountries.map(country => getISO3166TerritoryFromSlug(country)).map(country => country.iso_a2);
    const statusLabel = getLabelBySlug('MOVIE_STATUS', status);
    const features = [
        contentType[movie.main?.contentType],
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
