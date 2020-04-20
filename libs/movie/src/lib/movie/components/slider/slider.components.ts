// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// Blockframes
import { Movie } from '@blockframes/movie/+state';

function createMovieSliderView(movies: Movie[]) {
    return movies.map(movie => {
        return {
            directors: movie.main.directors,
            titles: {
                international: movie.main.title.international,
                original: movie.main.title.original
            },
            logline: movie.story.logline,
            banner: movie.promotionalElements.banner.media
        }
    })
}

type MovieSliderView = ReturnType<typeof createMovieSliderView>;

@Component({
    selector: 'movie-slider',
    templateUrl: './slider.component.html',
    styleUrls: ['./slider.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSliderComponent {
    movies: Movie[]
    movieViews: MovieSliderView[];
    @Input() set movie(movies: Movie[]) {
        this.movieViews = createMovieSliderView(movies) as any[]
        this.movies = movies;
    }
}