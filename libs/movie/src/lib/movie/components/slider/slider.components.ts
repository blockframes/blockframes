// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// Blockframes
import { Movie } from '@blockframes/movie/+state';

function createMovieSliderView(movie: Movie) {
    return {
        director: movie.main.directors,
        titles: {
            international: movie.main.title.international,
            original: movie.main.title.original
        },
        logline: movie.story.logline
    }
}

type MovieSliderView = ReturnType<typeof createMovieSliderView>;

@Component({
    selector: 'movie-slider',
    templateUrl: './slider.component.html',
    styleUrls: ['./slider.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSliderComponent {
    movieView: MovieSliderView;
    @Input() set movie(value: Movie) {
        this.movieView = createMovieSliderView(value)
    }
}