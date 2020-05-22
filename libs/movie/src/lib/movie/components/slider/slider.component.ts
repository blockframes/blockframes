// Angular
import { Component, ChangeDetectionStrategy, Input, Directive } from '@angular/core';

// Blockframes
import { Movie, Credit } from '@blockframes/movie/+state';
import { Title } from '@blockframes/movie/+state/movie.firestore';
import { ImgRef } from '@blockframes/utils/media/media.firestore';

interface MovieSliderView {
    directors: string | Credit[],
    titles: Title,
    logline: string,
    banner: ImgRef | string
}

function createMovieSliderView(movies: Movie[]): MovieSliderView[] {
    return movies.map(movie => {
        return {
            directors: movie.main?.directors || '',
            titles: {
                international: movie.main?.title.international || '',
                original: movie.main?.title.original || ''
            },
            logline: movie.story?.logline || '',
            banner: movie.promotionalElements?.banner.media || ''
        }
    })
}

@Component({
    selector: '[movies] movie-slider',
    templateUrl: './slider.component.html',
    styleUrls: ['./slider.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSliderComponent {
    titles: Movie[]
    movieViews: MovieSliderView[];
    @Input() set movies(movies: Movie[]) {
        this.movieViews = createMovieSliderView(movies);
        this.titles = movies;
    }
}

@Directive({
    selector: 'movie-slider-cta, [movieSliderCTA]',
    host: { class: 'movie-slider-cta' }
})
// tslint:disable-next-line: directive-class-suffix
export class MovieSliderCTA { }

@Directive({
    selector: 'movie-slider-actions, [movieSliderActions]',
    host: { class: 'movie-slider-actions' }
})
// tslint:disable-next-line: directive-class-suffix
export class MovieSliderActions { }